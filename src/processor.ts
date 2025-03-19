import { HtmlTagDescriptor } from "vite";
import { createPattern, Pattern } from "./match";
import { transformImportsMap, transformLink, transformScript } from "./transform";
import * as vm from "node:vm"
 
export type ProcessorPattern = {
  type: 'exact' | 'prefix';
  processor: Processor;
  config: CdnConfig;
  match: (source: string) => (string | undefined);
};

export type ProcessorHandler = {
  resolveId: (resolved: { id: string }, config: CdnConfig) => { id: string; external?: boolean } | null | undefined;
  transformIndexHtml: (html: string) => HtmlTagDescriptor[]
  load?: (id: string) => Promise<string | null> | string | null;
}

class Processor {
  status: 'pending' | 'resolved'; 

  type: string;
  
  map: Map<string, CdnConfig>;

  /**
   * Each config will generate two patterns.
   * One is exact match, the other is prefix match.
   * Exact match will external package.
   * Prefix match will mention user should clean it self
   */
  pattern: Map<string, ProcessorPattern[]>;

  /**
   * Handler is a collection of hooks to be called in rollup.
   * resolveId is used to judge whether the module is external.
   * transform is used to deal with virtual module.
   *  exp:
   *    import { render } from "\0virtual:vue"
   *    \0virtual:vue
   *      export * from "https://_link_to_esm_vue"
   * html is used to add element to html
   *  exp:
   *    <head>
   *      <script type="importmap">{ "imports": { "circle": "https://example.com/shapes/circle.js" } } </script>
   *      <link rel="preload" href="https://example.com/shapes/circle.js" as="script" type="module">
   *    </head>
   */
  handler: ProcessorHandler;

  constructor(options: {
    type: string;
    handler: {
      resolveId?: (resolved: { id: string }, config: CdnConfig) => { id: string; external?: boolean };
      transformIndexHtml?: (html: string, configs: CdnConfig[]) => HtmlTagDescriptor[];
      load?: (id: string, processor: Processor) =>  Promise<string | null> | string | null;
    };
  }) {
    this.status = 'pending'
    this.type = options.type;
    this.map = new Map();
    this.pattern = new Map();
    this.handler = {
      resolveId: (resolved, config) => {
        this.status = 'resolved'
        return options.handler.resolveId?.(resolved, config) || { id: resolved.id, external: true };
      },
      transformIndexHtml: (html: string) => {
        if(this.status === 'pending') return []
        const configs = [...this.map.values()];
        return options.handler.transformIndexHtml?.(html, configs) || [];
      },
      load: (id: string) => {
        if(this.status === 'pending') return null
        return options.handler.load?.(id, this) || null;
      }
    }
  }

  // judge config can be used by Processors
  is(config: CdnConfig) {
    return this.type === config.type;
  }

  getAllPatterns() {
    return [...this.pattern.entries()].reduce((acc, cur) => {
      const [, value] = cur;
      return acc.concat(value);
    }, [] as any[]);
  }

  private generatePattern(config: CdnConfig) {
    let patterns = this.pattern.get(config.type);

    if (!patterns) {
      this.pattern.set(config.type, (patterns = []));
    }

    patterns.push({
      type: "exact",
      processor: this,
      config,
      match: createPattern("exact", config.name),
    });

    patterns.push({
      type: "prefix",
      processor: this,
      config,
      match: createPattern("prefix", config.name),
    });
  }

  register(config: CdnConfig) {
    if (!this.is(config)) return;
    if (this.map.get(config.type)) return;
    this.map.set(config.name, config);
    this.generatePattern(config);
  }
}

export function createProcessors(config: CdnConfig[]) {
  return config.reduce((acc, cur) => {
    const { type } = cur;
    if (!acc[type]) {
      if (type === "importmap") {
        acc[type] = createImportmapProcessor();
      }
      if (type === "esm") {
        acc[type] = createEsmProcessor();
      }
      if (type === "iife") {
        acc[type] = createIIfeProcessor();
      }
    }
    acc[type].register(cur);
    return acc;
  }, {} as Record<string, Processor>);
}

function createImportmapProcessor() {
  return new Processor({
    type: "importmap",
    handler: {
      resolveId: (resolved,config) => {
        return { id: config.name, external: true };
      },
      transformIndexHtml(html, configs) {
        return transformImportsMap(configs);
      },
    },
  });
}

function createEsmProcessor() {
  return new Processor({
    type: "esm",
    handler: {
      resolveId: (resolved, config) => {
        return { id: config.url, external: true };
      },
      transformIndexHtml(html: string, configs: CdnConfig[]) {
        return configs.map(config => {
          const link = transformLink({
            rel: "preload",
            as: "script",
            type: "module",
            href: config.url
          })
          return link
        })
      }
    },
  });
}

function createIIfeProcessor() {
  return new Processor({
    type: "iife",
    handler: {
      resolveId: (resolved, config) => {
        if(!config.global) return { id: resolved.id };
        return { id: `virtual-es-cdn:${config.name}`, external: false };
      },
      async load(id, processor) {
        if(id.includes(`virtual-es-cdn:`)) {
          const name = id.split(':')[1]
          const context = {};
          const config = processor.map.get(name);
          if(!config) return null;
          const resp = await fetch(config.url);
          const text = await resp.text();
          const script = new vm.Script(text);
          script.runInNewContext(context)
          const keys = Object.keys((context as any).Vue);
          return `
            export default window.${config.global};
            export const {  
              ${keys.join(',')}
            } = window.${config.global};
          `
        }
        return null;
      },
      transformIndexHtml(html: string, configs: CdnConfig[]) {
        let result: HtmlTagDescriptor[] = []
        result = result.concat(
          configs.map(config => {
            return transformScript({
              src: config.url,
              type: "text/javascript"
            })
          })
        )
        return result
      }
    },
  });
}
