"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUrlParams = exports.overrideUrl = exports.buildQueryString = exports.parseUrlParams = exports.parseQueryString = void 0;
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
function safeDecodeURIComponent(str) {
    try {
        // Replace standalone '%' with '%25'
        const sanitizedStr = str.replace(/%(?![0-9a-fA-F]{2})/g, "%25");
        return decodeURIComponent(sanitizedStr);
    }
    catch (e) {
        console.error("safeDecodeURIComponent Error: ", e);
        return str;
    }
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
            return value === "0" || value.toLowerCase() === "false" ? false : Boolean(value);
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
            return Boolean(value);
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
    const paramPairs = queryString.split("&");
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
function buildQueryString({ params, encodeURI = false, removeEmptyParams = false, }) {
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
exports.buildQueryString = buildQueryString;
function overrideUrl({ url, params, encodeURI = false, removeEmptyParams = false, }) {
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
//# sourceMappingURL=index.js.map