
type CdnConfig = {
  type: 'importmap' | 'esm' | 'iife',
  name: string,
  url: string,
}

type CdnOption = {
  cdn: CdnConfig[],
}
