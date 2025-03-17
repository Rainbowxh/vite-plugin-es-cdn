
type PluginOption = {
  type: 'importmap' | 'script'
}

export default function plugin(options: PluginOption) {
  return {
    name: 'vite-plugin-cdn-import',
    transformIndexHtml(html: any) {
      console.log('test sth', html)
      return html
    }
  }
}
