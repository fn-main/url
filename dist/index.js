"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeDecodeURI = exports.safeEncodeURI = exports.safeDecodeURIComponent = exports.safeEncodeURIComponent = exports.isEncoded = exports.joinPath = exports.decodeMiniProgramWebviewUrl = exports.encodeMiniProgramWebviewUrl = exports.parseUrl = exports.removeUrlParams = exports.overrideUrl = exports.encodeSpecialChars = exports.buildQueryString = exports.parseUrlParams = exports.parseQueryString = void 0;
var Type;
(function (Type) {
    Type[Type["Undefined"] = 0] = "Undefined";
    Type[Type["Null"] = 1] = "Null";
    Type[Type["Boolean"] = 2] = "Boolean";
    Type[Type["Number"] = 3] = "Number";
    Type[Type["JSON"] = 4] = "JSON";
    Type[Type["Date"] = 5] = "Date";
    Type[Type["String"] = 6] = "String";
})(Type || (Type = {}));
function isEmpty(value) {
    if (value === undefined || value === null || value === "") {
        return true;
    }
    return false;
}
// function safeDecodeURIComponent(str: string) {
//   try {
//     // Replace standalone '%' with '%25'
//     const sanitizedStr = str.replace(/%(?![0-9a-fA-F]{2})/g, "%25");
//     return decodeURIComponent(sanitizedStr);
//   } catch (e) {
//     console.error("safeDecodeURIComponent Error: ", e);
//     return str;
//   }
// }
function stringToBool(value) {
    const falsyValues = ["false", "", "0", "null", "undefined", "NaN"];
    return !falsyValues.includes(value);
}
function parseValue(value, type) {
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
function inferType(value) {
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
        }
        catch (_a) {
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
function inferValue(value) {
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
function stringifyValue(value) {
    if (value instanceof Date) {
        return value.toISOString();
    }
    const prototype = Object.prototype.toString.call(value);
    if (prototype === "[object Object]" || prototype === "[object Array]") {
        return JSON.stringify(value);
    }
    return String(value);
}
function parseQueryString({ queryString, paramTypeMap, autoInferType = true, }) {
    const ret = {};
    queryString = queryString.replace(/^\?/, "");
    const paramPairs = queryString ? queryString.split("&") : [];
    for (const pair of paramPairs) {
        const [key, value] = pair.split("=").map(safeDecodeURIComponent);
        if (paramTypeMap && paramTypeMap[key]) {
            // have parsing rule, parse
            ret[key] = parseValue(value, paramTypeMap[key]);
        }
        else if (autoInferType) {
            // no parsing rule, infer
            ret[key] = inferValue(value);
        }
        else {
            // not in parsing rule, and not infer and convert type, just return original string
            ret[key] = value;
        }
    }
    return ret;
}
exports.parseQueryString = parseQueryString;
function parseUrlParams({ url, paramTypeMap, autoInferType = true, }) {
    const { search } = parseUrl(url);
    return parseQueryString({ queryString: search, paramTypeMap, autoInferType });
}
exports.parseUrlParams = parseUrlParams;
function buildQueryString({ params, encodeURI = false, removeEmptyParams = false, sort = false, }) {
    let entries = Object.entries(params);
    if (removeEmptyParams) {
        entries = entries.filter(([key, value]) => {
            if (isEmpty(value)) {
                return false;
            }
            return true;
        });
    }
    if (sort) {
        entries = entries.sort(([key1], [key2]) => {
            return key1.localeCompare(key2);
        });
    }
    const paramPairs = entries.map(([key, value]) => {
        let strValue = stringifyValue(value);
        if (encodeURI) {
            strValue = safeEncodeURIComponent(strValue);
        }
        else {
            strValue = encodeSpecialChars(strValue);
        }
        return `${key}=${strValue}`;
    });
    if (paramPairs.length === 0) {
        return "";
    }
    return "?" + paramPairs.join("&");
}
exports.buildQueryString = buildQueryString;
function encodeSpecialChars(str, regex) {
    return str.replace(regex || /([?=&#/+ %])/g, encodeURIComponent);
}
exports.encodeSpecialChars = encodeSpecialChars;
function overrideUrl({ url, params, encodeURI = false, removeEmptyParams = false, sort = false, }) {
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
    const queryString = buildQueryString({ params: oldParams, encodeURI, removeEmptyParams, sort });
    const ret = `${domain}${pathname}${queryString}${hash}`;
    return ret;
}
exports.overrideUrl = overrideUrl;
function removeUrlParams(url, params) {
    // Determine the parameters to remove
    let paramsToRemove = Array.isArray(params) ? params : Object.keys(params);
    // Iterate over each parameter to remove
    paramsToRemove.forEach((param) => {
        // Create a regex pattern to find the parameter in the URL
        const pattern = `([?&])${param}=([^&]*)`;
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
exports.removeUrlParams = removeUrlParams;
function parseUrl(url) {
    const regex = /^(https?:\/\/)?(([^\/?#:]+)(:\d+)?)?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/;
    const match = url.match(regex);
    if (!match) {
        return {
            domain: "",
            pathname: "",
            search: "",
            hash: "",
        };
    }
    // 合并 protocol 和　domain
    const protocol = match[1] || "";
    const domain = match[2] || "";
    return {
        domain: protocol + domain,
        pathname: match[5] || "",
        search: match[6] || "",
        hash: match[7] || "",
    };
}
exports.parseUrl = parseUrl;
function encodeMiniProgramWebviewUrl(webviewUrl) {
    return webviewUrl.replace(/\?/g, "^question").replace(/=/g, "^equal").replace(/&/g, "^and");
}
exports.encodeMiniProgramWebviewUrl = encodeMiniProgramWebviewUrl;
function decodeMiniProgramWebviewUrl(webviewUrl) {
    return webviewUrl
        .replace(/\^question/g, "?")
        .replace(/\^equal/g, "=")
        .replace(/\^and/g, "&");
}
exports.decodeMiniProgramWebviewUrl = decodeMiniProgramWebviewUrl;
function joinPath(...segments) {
    return segments.join("/").replace(/([^:]\/)\/+/g, "$1");
}
exports.joinPath = joinPath;
function isEncoded(str) {
    try {
        return str !== decodeURIComponent(str);
    }
    catch (e) {
        return false; // 如果解码时发生错误，表示不是有效的编码
    }
}
exports.isEncoded = isEncoded;
function safeEncodeURIComponent(str) {
    return isEncoded(str) ? str : encodeURIComponent(str);
}
exports.safeEncodeURIComponent = safeEncodeURIComponent;
function safeDecodeURIComponent(str) {
    try {
        return isEncoded(str) ? decodeURIComponent(str) : str;
    }
    catch (e) {
        return str; // 如果解码时发生错误，返回原字符串
    }
}
exports.safeDecodeURIComponent = safeDecodeURIComponent;
function safeEncodeURI(str) {
    return isEncoded(str) ? str : encodeURI(str);
}
exports.safeEncodeURI = safeEncodeURI;
function safeDecodeURI(str) {
    try {
        return isEncoded(str) ? decodeURI(str) : str;
    }
    catch (e) {
        return str; // 如果解码时发生错误，返回原字符串
    }
}
exports.safeDecodeURI = safeDecodeURI;
//# sourceMappingURL=index.js.map