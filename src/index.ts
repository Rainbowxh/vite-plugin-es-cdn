import type { IndexHtmlTransformHook } from "vite";
import { generateImportsMap, generateImportsMapDev, generateLink } from "./transfer-html";

export default function vitePluginEsCdn(options: CdnOption) {
  return {
    name: "vite-plugin-cdn-import",
    type: "build",
    transformIndexHtml(html: IndexHtmlTransformHook) {
      const links = options.cdn.map((item) =>
        generateLink({ href: item.url, rel: "preload", as: "script" })
      );
      const importMap = generateImportsMap(options.cdn);
      const test = generateImportsMapDev()
      return [...links, importMap, test];
    },
  };
}
