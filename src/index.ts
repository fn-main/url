enum Type {
  Undefined,
  Null,
  Boolean,
  Number,
  JSON,
  Date,
  String,
}

function isEmpty(value: any) {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  return false;
}

function safeDecodeURIComponent(str: string) {
  try {
    // Replace standalone '%' with '%25'
    const sanitizedStr = str.replace(/%(?![0-9a-fA-F]{2})/g, "%25");
    return decodeURIComponent(sanitizedStr);
  } catch (e) {
    console.error("safeDecodeURIComponent Error: ", e);
    return str;
  }
}

function stringToBool(value: string): boolean {
  const falsyValues = ["false", "", "0", "null", "undefined", "NaN"];
  return !falsyValues.includes(value);
}

function parseValue(value: string, type: string): any {
  type = type.toLowerCase();

  switch (type) {
    case "string":
      return String(value);
    case "number":
    case "int":
    case "integer":
    case "float":
    case "double":
      return Number(value);
    case "bool":
    case "boolean":
      return stringToBool(value);
    case "date":
      return new Date(Date.parse(value));
    case "object":
    case "json":
      return value && value !== "undefined" ? JSON.parse(value) : null;
  }
}

function inferType(value: string): Type {
  // empty string
  if (value === "") {
    return Type.String;
  }

  if (value === "undefined") {
    return Type.Undefined;
  }

  if (value === "null") {
    return Type.Null;
  }

  // bool
  if (value === "true" || value === "false") {
    return Type.Boolean;
  }

  // number
  if (isNaN(Number(value)) === false) {
    return Type.Number;
  }

  // json
  if (/(^\{.*\}$)|(^\[.*\]$)/.test(value)) {
    try {
      JSON.parse(value);
      return Type.JSON;
    } catch {
      // to nothing
    }
  }

  // date
  if (/^\d{4}-\d{1,2}-\d{1,2}.+\d{1,2}:\d{1,2}/.test(value)) {
    // may be datetime
    const timestamp = Date.parse(value);
    if (isNaN(timestamp) === false && timestamp >= 0 && timestamp < 4102444800000) {
      // date is between 1970-2100
      return Type.Date;
    }
  }

  // string
  return Type.String;
}

function inferValue(value: string): any {
  switch (inferType(value)) {
    case Type.Undefined:
      return undefined;
    case Type.Null:
      return null;
    case Type.Boolean:
      return stringToBool(value);
    case Type.Number:
      return Number(value);
    case Type.JSON:
      return JSON.parse(value);
    case Type.Date:
      return new Date(Date.parse(value));
    default:
      return value;
  }
}

function stringifyValue(value: any) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  const prototype = Object.prototype.toString.call(value);
  if (prototype === "[object Object]" || prototype === "[object Array]") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function parseQueryString({
  queryString,
  paramTypeMap,
  autoInferType = true,
}: {
  queryString: string;
  paramTypeMap?: { [key: string]: string };
  autoInferType?: boolean;
}): { [key: string]: any } {
  const ret: any = {};

  queryString = queryString.replace(/^\?/, "");

  const paramPairs = queryString ? queryString.split("&") : [];

  for (const pair of paramPairs) {
    const [key, value] = pair.split("=").map(safeDecodeURIComponent);
    if (paramTypeMap && paramTypeMap[key]) {
      // have parsing rule, parse
      ret[key] = parseValue(value, paramTypeMap[key]);
    } else if (autoInferType) {
      // no parsing rule, infer
      ret[key] = inferValue(value);
    } else {
      // not in parsing rule, and not infer and convert type, just return original string
      ret[key] = value;
    }
  }
  return ret;
}

export function parseUrlParams({
  url,
  paramTypeMap,
  autoInferType = true,
}: {
  url: string;
  paramTypeMap?: { [key: string]: string };
  autoInferType?: boolean;
}): { [key: string]: any } {
  const { search } = parseUrl(url);
  return parseQueryString({ queryString: search, paramTypeMap, autoInferType });
}

export function buildQueryString({
  params,
  encodeURI = false,
  removeEmptyParams = false,
}: {
  params: { [key: string]: any };
  encodeURI?: Boolean;
  removeEmptyParams?: Boolean;
}): string {
  let entries = Object.entries(params);
  if (removeEmptyParams) {
    entries = entries.filter(([key, value]) => {
      if (isEmpty(value)) {
        return false;
      }
      return true;
    });
  }

  const paramPairs = entries.map(([key, value]) => {
    let strValue = stringifyValue(value);
    strValue = encodeURI ? encodeURIComponent(strValue) : strValue;
    return `${key}=${strValue}`;
  });

  return "?" + paramPairs.join("&");
}

export function overrideUrl({
  url,
  params,
  encodeURI = false,
  removeEmptyParams = false,
}: {
  url: string;
  params: { [key: string]: any };
  encodeURI?: Boolean;
  removeEmptyParams?: Boolean;
}): string {
  const { domain, pathname, search, hash } = parseUrl(url);
  const oldParams = parseQueryString({
    queryString: search,
    autoInferType: false, // if not override, don't touch
  });
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      // use new params override old params
      oldParams[key] = params[key];
    }
  }

  const queryString = buildQueryString({ params: oldParams, encodeURI, removeEmptyParams });
  const ret = `${domain}${pathname}${queryString}${hash}`;

  return ret;
}

export function removeUrlParams(url: string, params: string[] | Record<string, any>): string {
  // Determine the parameters to remove
  let paramsToRemove: string[] = Array.isArray(params) ? params : Object.keys(params);

  // Iterate over each parameter to remove
  paramsToRemove.forEach((param) => {
    // Create a regex pattern to find the parameter in the URL
    const pattern: string = `([?&])${param}=([^&]*)`;

    // Replace occurrences of the parameter with an appropriate character
    url = url.replace(new RegExp(pattern, "g"), (match, start, value) => {
      // If the parameter starts with '?', replace it with '?', otherwise remove it
      return start === "?" ? "?" : "";
    });
  });

  // Clean up any leading '&' if it's the first character in the query string
  url = url.replace(/(\?&)/, "?");
  // Clean up any trailing '?' or '&' left in the URL
  url = url.replace(/[?&]$/, "");

  return url;
}

export function parseUrl(url: string) {
  const regex = /^((?:https?:\/\/)?[^\/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/;
  const match = url.match(regex);

  if (!match) {
    return {
      domain: "",
      pathname: "",
      search: "",
      hash: "",
    };
  }

  return {
    domain: match[1] || "",
    pathname: match[2] || "",
    search: match[3] || "",
    hash: match[4] || "",
  };
}

export function encodeMiniProgramWebviewUrl(webviewUrl: string) {
  return webviewUrl.replace(/\?/g, "^question").replace(/=/g, "^equal").replace(/&/g, "^and");
}

export function decodeMiniProgramWebviewUrl(webviewUrl: string) {
  return webviewUrl
    .replace(/\^question/g, "?")
    .replace(/\^equal/g, "=")
    .replace(/\^and/g, "&");
}

export function joinPath(...segments: string[]) {
  return segments.join("/").replace(/([^:]\/)\/+/g, "$1");
}
