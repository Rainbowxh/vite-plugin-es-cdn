import { HtmlTagDescriptor } from "vite";
/**
 * This file used to add scripts and links to html
 */

export function transformImportsMap(
  config: { name: string; url: string }[]
): HtmlTagDescriptor[] {
  const importsContent = config.map(({ name, url }) => `"${name}": "${url}"`).join(",\n");

  if(!importsContent) return [];

  return [{
    tag: "script",
    injectTo: 'head',
    attrs: {
      type: "importmap",
    },
    children: `
    {
      "imports": {
        ${importsContent}
      }
    }
    `,
  }];
}

export function transformImportsMapDev(): HtmlTagDescriptor {
  return {
    tag: "script",
    injectTo: 'head',
    attrs: {
      type: "module",
    },
    children: `import { h } from "vue"; window.alert(h)`,
  }
}

// 导出一个函数，用于生成link标签
export function transformLink(attrs: {
  rel: 'preload' | 'prefetch' | 'dns-prefetch' | 'modulepreload' | 'prerender',
  as?: 'fetch' | 'font' | 'image' | 'script' | 'style' | 'video' | 'worker',
  type?: "module" | string,
  href: string
}, injectTo: 'head' = 'head'): HtmlTagDescriptor {
  // 返回一个对象，包含tag和attrs两个属性
  return {
    tag: 'link',
    attrs,
    injectTo
  }
}

export function transformScript(attrs: {
  src: string,
  type?: 'module' | string;
}) :HtmlTagDescriptor {
  return {
    tag: 'script',
    attrs,
    injectTo: 'head'
  }
}
