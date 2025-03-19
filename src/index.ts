import { type HtmlTagDescriptor } from "vite";
import { createProcessors, ProcessorPattern } from "./processor";

export default function vitePluginEsCdn(options: CdnOption) {
  const processors = createProcessors(options.cdn);
  const patterns = Object.values(processors).reduce(
    (acc, cur) => acc.concat(cur.getAllPatterns()),
    [] as ProcessorPattern[]
  );

  return [
    {
      name: "vite-plugin-cdn-import:resolveId",
      enforce: "pre",
      resolveId(source: string, importer: string) {
        for (let pattern of patterns) {
          const { type, config, match, processor } = pattern;
          if (!match(source)) continue;

          if (type === "prefix") {
            // mention user to use full name
            console.warn(
              `[import-cdn] use full name for ${config.name}, source: ${source}, importer: ${importer}`
            );
          }

          if (type === "exact") {
            return (this as any)
              .resolve(source, importer, { skipSelf: true, ...options })
              .then((resolved: { id: string } | null) => {
                // deal component do not installed situtation 
                if(!resolved) {
                  const res = processor.handler.resolveId?.(resolved || { id: source }, config)
                  return { ...res, external: true };
                }else {
                  const res = processor.handler.resolveId?.(resolved, config)
                  return { external: false, ...res };
                }
              });
          }

          return null;
        }

        return null;
      },
      async load(id: string) {
        if (id.includes("virtual-es-cdn:")) {
          for (let key of Object.keys(processors)) {
            const processor = processors[key];
            let result = await processor.handler.load?.(id);
            if (result) {
              return result;
            }
          }
        }
        return null;
      },
    },
    {
      name: "vite-plugin-cdn-import",

      transformIndexHtml(html: string): HtmlTagDescriptor[] {
        let result: HtmlTagDescriptor[] = [];
        for (let key of Object.keys(processors)) {
          const processor = processors[key];
          result = result.concat(processor.handler.transformIndexHtml(html));
        }
        return result;
      },
    },
  ];
}
