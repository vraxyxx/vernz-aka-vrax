import formatWith from "@cass-modules/format-with";

export class LangParser {
  private readonly parsedData: Map<string, string> = new Map();

  constructor(content: string = "") {
    this.parse(content);
  }

  public static stringify(
    data: Map<string, string> | { [key: string]: string }
  ): string {
    let entries: [string, string][];

    if (data instanceof Map) {
      entries = Array.from(data.entries());
    } else {
      const flattenObject = (
        obj: { [key: string]: string },
        prefix: string = ""
      ): [string, string][] => {
        return Object.entries(obj).flatMap(([key, value]) => {
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (value && typeof value === "object" && !Array.isArray(value)) {
            return flattenObject(value as { [key: string]: string }, newKey);
          }
          const jsonValue = JSON.stringify(String(value));
          return [[newKey, jsonValue] as [string, string]];
        });
      };
      entries = flattenObject(data);
    }

    return entries.map(([key, value]) => `${key}=${value}`).join("\n");
  }

  public static parse(content: string): Map<string, string> {
    const result = new Map<string, string>();

    content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        const value = valueParts.join("=");

        if (key) {
          const trimmedKey = key.trim();
          const trimmedValue = value.trim();

          try {
            const parsedValue = JSON.parse(trimmedValue);
            if (typeof parsedValue === "string") {
              result.set(trimmedKey, parsedValue);
            }
          } catch (e) {
            // Ignore invalid JSON, only accept valid JSON strings
          }
        }
      });

    return result;
  }

  public parse(content: string): this {
    this.parsedData.clear();
    const parsed = LangParser.parse(content);
    parsed.forEach((value, key) => this.parsedData.set(key, value));
    return this;
  }

  public setContent(content: string): this {
    return this.parse(content);
  }

  public get(key: string): string | undefined {
    return this.parsedData.get(key);
  }

  public entries(): Map<string, string> {
    return new Map(this.parsedData);
  }

  public raw(): Record<string, string> {
    return Object.fromEntries(this.parsedData);
  }

  public toString(): string {
    return LangParser.stringify(this.parsedData);
  }

  public createGetLang(
    langs?: Record<string, Record<string, string>>,
    k1?: string
  ) {
    langs ??= {};
    k1 ||= global.Cassidy.config.defaultLang ?? "en";
    return (key_: string, ...replacers_: any[]) => {
      const replacers = replacers_.map(String);
      let key = String(key_);
      const item =
        langs?.[k1]?.[key] ||
        langs?.[global.Cassidy.config.defaultLang]?.[key] ||
        this.get(key);

      if (!item) {
        return `❌ Cannot find language properties: "${key}"`;
      }

      if (
        "formatWith" in String.prototype &&
        typeof String.prototype.formatWith === "function"
      ) {
        return item.formatWith(...replacers);
      }
      return formatWith(item, ...replacers);
    };
  }
}
