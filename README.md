<h1 align="center">vite-plugin-es-cdn</h1>

<p align="center">
  A Vite plugin for automatically importing packages from CDN in esm projects.
</p>

## Installation

```sh
pnpm i vite-plugin-es-cdn -D
```

## Configuration Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `mode` | `'dev'` \| `'string'` | Specifies whether it is a build or development environment. |
| `cdn` | `cdnConfig[]` | Collection of CDN configurations. |
| ├ `name` | `string` | CDN package name. |
| ├ `type` | `'importmap'` \| `'esm'` \| `'iife'` | Type of CDN integration. |
| ├ `url` | `string` | CDN resource URL. |
| ├ `global` | `string` | Only applicable for `'iife'` type to define the global namespace. |

## Usage

This plugin supports three types of CDN script imports:

- **Importmap**
- **ESM**
- **IIFE**

⚠ **Notice**: Do not manually configure the Rollup `external` option. In some cases, Vite may fail to resolve external dependencies correctly when this is set.

### Importmap Example

```ts
// vite.config.ts
import { defineConfig } from "vite";
import esCdn from "vite-plugin-es-cdn";

// For Vue
export default defineConfig({
  plugins: [
    esCdn({
      cdn: [
        {
          name: "vue",
          type: "importmap",
          url: "https://cdn.jsdelivr.net/npm/vue@3.5.13/+esm",
        },
      ],
    }),
  ],
});

// For React
export default defineConfig({
  plugins: [
    react(),
    esCdn({
      cdn: [
        {
          name: "react",
          type: "importmap",
          url: "https://cdn.jsdelivr.net/npm/react@19.0.0/+esm",
        },
        {
          name: "react-dom",
          type: "importmap",
          url: "https://cdn.jsdelivr.net/npm/react-dom@19.0.0/client/+esm",
        },
      ],
    }),
  ],
});
```

### ESM Example

```ts
// vite.config.ts
import { defineConfig } from "vite";
import esCdn from "vite-plugin-es-cdn";

export default defineConfig({
  plugins: [
    esCdn({
      cdn: [
        {
          name: "vue",
          type: "esm",
          url: "https://cdn.jsdelivr.net/npm/vue@3.5.13/+esm",
        },
      ],
    }),
  ],
});

export default defineConfig({
  plugins: [
    esCdn({
      cdn: [
        {
          name: "react",
          type: "esm",
          url: "https://cdn.jsdelivr.net/npm/react@19.0.0/+esm",
        },
        {
          name: "react-dom/client",
          type: "esm",
          url: "https://cdn.jsdelivr.net/npm/react-dom@19.0.0/client/+esm",
        },
      ],
    }),
  ],
});
```

⚠ **Note**: If using Vite in development mode, configure it as follows:

```ts
export default defineConfig({
  plugins: [
    esCdn({
      mode: "dev",
      cdn: [
        {
          name: "vue",
          type: "importmap",
          url: "https://cdn.jsdelivr.net/npm/vue@3.5.13/+esm",
        },
      ],
    }),
  ],
});
```

In development mode, Vite automatically prefixes modules marked as `external: true` with `/@id/`. Thus, distinguishing between build and dev environments is essential.

Example transformation:

```html
<!-- Original -->
<script type="importmap">
  {
    "imports": {
      "vue": "https://cdn.jsdelivr.net/npm/vue@3.5.13/+esm"
    }
  }
</script>

<!-- Transformed in development mode -->
<script type="importmap">
  {
    "imports": {
      "/@id/vue": "https://cdn.jsdelivr.net/npm/vue@3.5.13/+esm"
    }
  }
</script>
```

### IIFE Example

```ts
// vite.config.ts
import { defineConfig } from "vite";
import esCdn from "vite-plugin-es-cdn";

export default defineConfig({
  plugins: [
    esCdn({
      cdn: [
        {
          name: "vue",
          type: "iife",
          global: "Vue",
          url: "https://cdn.bootcdn.net/ajax/libs/vue/3.5.13/vue.global.min.js",
        },
      ],
    }),
  ],
});
```

## Playground

You can explore examples in the playground:

```sh
pnpm run test

cd playground
pnpm run preview
