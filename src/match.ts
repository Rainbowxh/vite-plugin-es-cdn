export type Pattern = {
  type: "exact" | "like"; // exact: v === name, like: name.startsWidth(v) in order to mention some situation like import { xx } from "vue/xxx"
  regexp: RegExp;
  config: CdnConfig;
};

export function generateMatchFunction(option: CdnOption) {
  const { cdn } = option;
  const patterns: Pattern[] = [];

  if (!cdn || !Array.isArray(cdn)) return;

  cdn.forEach((item) => {
    if (typeof item.name === "string") {
      patterns.push({
        type: "exact",
        regexp: new RegExp(`^${item.name}$`),
        config: item,
      });

      patterns.push({
        type: "like",
        regexp: new RegExp(`^${item.name}/.*$`),
        config: item,
      });
    }
  });

  return (source: string, importer: string) => {
    let result = null;
    for (const pattern of patterns) {
      if (pattern.regexp.test(source)) {
        if (pattern.type === "exact") {
          result = pattern.config;
          continue;
        }
        if (pattern.type === "like") {
          console.warn(
            `\n\x1b[33m[import-cdn warning] Unexpected import like 'import * from "_pattern/"' \x1b[0m`
          );
          console.warn(`\x1b[33m[import-cdn warning] Source: ${source}\x1b[0m`);
          console.warn(
            `\x1b[33m[import-cdn warning] Importer: ${importer}\x1b[0m\n`
          );
        }
      }
    }
    return result;
  };
}

// generate a pattern function for exact or like.
export function createPattern(
  type: "exact" | "prefix",
  name: string | RegExp,
): ((source: string) => string | undefined)  {
  return (source: string) => {
    let regex;

    if(name instanceof RegExp) {
      return name.test(source) ? source : undefined;
    }

    if (type === "exact") {
      regex = new RegExp(`^${name}$`);
    }

    if (type === "prefix") {
      regex = new RegExp(`^${name}/.*$`);
    }

    if (!regex) return;

    if (regex.test(source)) {
      return source
    }

    return;
  };
}
