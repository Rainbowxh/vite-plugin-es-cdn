
type CdnConfig = {
  type: 'importmap' | 'esm' | 'iife',
  name: string,
  url: string,
  global?: string,
}

type CdnOption = {
  mode: "dev" | "build",
  cdn: CdnConfig[],
}
