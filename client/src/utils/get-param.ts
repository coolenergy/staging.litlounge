import { ParsedUrlQuery } from "querystring";

function getParam(
  query: ParsedUrlQuery | undefined,
  name: string,
  options: {
    take?: "first" | "last";
  } = {}
) {
  if (query == null) {
    return undefined;
  }
  const v = query[name];
  const { take = "first" } = options;
  return Array.isArray(v) ? v[take === "first" ? 0 : v.length - 1] : v;
}

export { getParam };
