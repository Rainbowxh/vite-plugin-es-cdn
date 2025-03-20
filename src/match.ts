export type Pattern = {
  type: "exact" | "like"; // exact: v === name, like: name.startsWidth(v) in order to mention some situation like import { xx } from "vue/xxx"
  regexp: RegExp;
  config: CdnConfig;
};

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
