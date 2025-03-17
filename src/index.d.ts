
type CdnConfig = {
  type: 'esm' | 'iife' | 'commonjs' | 'umd',
  name: string,
  url: string,
}

type CdnOption = {
  type: 'importmap' | 'default',
  cdn: CdnConfig[],
}
