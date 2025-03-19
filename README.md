<h1 align="center">vite-plugin-es-cdn</h1>

<p align="center">
  A Vite plugin for automatically importing packages from CDN in esm projects.
</p>

## Install

```sh
pnpm i vite-plugin-es-cdn -D
```

## Usage

Plugin supports three types of cdn script:
- importmap
- esm
- iife

! Notice that please do not config rollup `external` option what you want. Because in some cases, vite will not be able to get the external dependencies when external is configured.

### Usage of **importmap**.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import esCdn from "vite-plugin-es-cdn";

export default defineConfig({
  plugins: [
    esCdn({
      name: "vue",
      type: "importmap",
      url: "https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.min.js",
    }),
  ],
});
```

### Usage of **esm**.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import esCdn from "vite-plugin-es-cdn";

export default defineConfig({
  plugins: [
    esCdn({
      name: "vue",
      type: "esm",
      url: "https://cdn.jsdelivr.net/npm/vue@3.5.13/+esm",
    }),
  ],
});
```

### Usage of **esm**.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import esCdn from "vite-plugin-es-cdn";

export default defineConfig({
  plugins: [
    esCdn({
      name: "vue",
      type: "iife",
      global: "Vue",
      url: "https://cdn.bootcdn.net/ajax/libs/vue/3.5.13/vue.global.min.js",
    }),
  ],
});
```

## Playground

You can see example in playground.
```
pnpm run test

cd playground
pnpm run preview 
```
