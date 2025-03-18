import { HtmlTagDescriptor, IndexHtmlTransformHook } from "vite";
import { transformImportsMap } from "./transform";
import { generatePatterns, Pattern } from "./match";

interface BaseProcessor {
  handleResolveId: (config: CdnConfig, resolved: { id: string }) => any;

  handleLoad?: (id: string) => string;

  handleTransformIndexHtml?: (
    html: string
  ) => null | HtmlTagDescriptor | HtmlTagDescriptor[];
}

abstract class Processor implements BaseProcessor {
  abstract type: string;

  abstract collections: Record<string, CdnConfig & { patterns: Pattern[] }>;

  handleResolveId(config: CdnConfig, resolved: { id: string }) {
    return null;
  }

  is(config: CdnConfig) {
    return config.type === this.type;
  }

  match(source: string, importer: string) {
    for (const [key, { patterns }] of Object.entries(this.collections)) {
      for(const pattern of patterns) {
        if (pattern.regexp.test(source)) {
          return {
            pattern,
            config: this.collections[key],
          };
        }
      }
    }

    return null;
 }

  register(config: CdnConfig) {
    if(this.collections[config.name]) return;
    const patten = generatePatterns(config);
    this.collections[config.name] = {
      ...config,
      patterns: patten,
    } ;
  }
}

class ImportMapProcessor extends Processor implements BaseProcessor  {
  type: "importmap";
  collections: Record<string, CdnConfig & { patterns: Pattern[]; }> = {};

  constructor() {
    super();
    this.type = "importmap";
  }

  handleResolveId(config: CdnConfig, resolved: { id: string }) {
    return null;
  }
}


class EsmProcessor implements BaseProcessor {
  type: "esm";
  collections: Record<string, CdnConfig & { patterns?: Pattern[] }> = {};

  constructor() {
    this.type = "esm";
  }

  register(config: CdnConfig) {
    if(this.collections[config.name]) return;
    const patten = generatePatterns(config);
    this.collections[config.name] = {
      ...config,
      patterns: patten,
    } ;
  }

  is(config: CdnConfig) {
    return config.type === "esm";
  }


  handleResolveId(config: CdnConfig, resolved: { id: string }) {
    return {
      id: config.url,
      external: true,
    };
  }
}

export function getAllProcessors(
  options: CdnOption
): Record<string, BaseProcessor> {
  const importMapProcessor = new ImportMapProcessor();
  const esmProcessor = new EsmProcessor();
  const processors: BaseProcessor[] = [importMapProcessor, esmProcessor];
  const { cdn } = options;

  cdn.forEach((config) => {
    processors.forEach((processor) => {
      if (processor.is(config)) {
        processor.register(config);
      }
    });
  });

  return {
    importmap: importMapProcessor,
    esm: esmProcessor,
  };
}
