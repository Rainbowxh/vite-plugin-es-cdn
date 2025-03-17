import { HtmlTagDescriptor } from "vite";
/**
 * This file used to add scripts and links to html
 */

export function generateImportsMap(
  config: { name: string; url: string }[]
): HtmlTagDescriptor | null {
  const importsContent = config.map(({ name, url }) => `"${name}": "${url}"`).join(",\n");

  if(!importsContent) return null;

  return {
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
  };
}

export function generateImportsMapDev(): HtmlTagDescriptor {
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
export function generateLink(attrs: {
  rel: 'preload' | 'prefetch' | 'dns-prefetch' | 'modulepreload' | 'prerender',
  as?: 'fetch' | 'font' | 'image' | 'script' | 'style' | 'video' | 'worker',
  href: string
}): HtmlTagDescriptor {
  // 返回一个对象，包含tag和attrs两个属性
  return {
    tag: 'link',
    attrs,
  }
}
