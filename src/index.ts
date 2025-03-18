import type { HtmlTagDescriptor, IndexHtmlTransformHook } from "vite";
import { transformImportsMap } from "./transform";
import { generateMatchFunction } from "./match";
import { getAllProcessors } from "./processor";

export default function vitePluginEsCdn(options: CdnOption) {
  const map = new Map();
  const processors = getAllProcessors(options)
  return [
    {
      name: "vite-plugin-cdn-import:resolveId",
      enforce: "pre",
      resolveId(source: string, importer: string) {
        const matchFunction = generateMatchFunction(options);
        if (matchFunction) {
          const matched = matchFunction(source, importer);
          if (matched) {
            return (this as any)
              .resolve(source, importer, { skipSelf: true, ...options })
              .then((resolved: { id: string } | null) => {
                if (!resolved) return null;
                map.set(matched.name, matched);

                if (matched.type === "importmap") {
                  return { id: resolved.id, external: true };
                }

                if (matched.type === "esm") {
                  return { id: matched.url, external: true };
                }

              });
          }
        }
        return null;
      },
      load(id: string) {
      }
    },
    {
      name: "vite-plugin-cdn-import",
      transformIndexHtml(
        html: IndexHtmlTransformHook
      ): HtmlTagDescriptor[] | null | IndexHtmlTransformHook | undefined {
        console.log("this is a test", processors.esm.handleResolveId)
        const { cdn } = options;

        if (!cdn || !Array.isArray(cdn) || cdn.length === 0) return html;

        const result: HtmlTagDescriptor[] = [];

        const config: Record<CdnConfig["type"], CdnConfig[]> = {
          importmap: [],
          esm: [],
          iife: [],
        };

        cdn.forEach((item) => {
          if (!config[item.type]) {
            config[item.type] = [];
          }

          if (map.has(item.name)) {
            config[item.type].push(item);
          }
        });

        Object.entries(config).forEach(([type, value]) => {
          if (type === "importmap") {
            const r = transformImportsMap(value);
            r && result.push(r);
          }
        });

        return result;
      },
    },
  ];
}
