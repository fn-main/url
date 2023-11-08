"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideUrl = exports.buildQueryString = exports.parseUrlParams = exports.parseQueryString = void 0;
var Type;
(function (Type) {
    Type[Type["Undefined"] = 0] = "Undefined";
    Type[Type["Null"] = 1] = "Null";
    Type[Type["NaN"] = 2] = "NaN";
    Type[Type["Boolean"] = 3] = "Boolean";
    Type[Type["Number"] = 4] = "Number";
    Type[Type["JSON"] = 5] = "JSON";
    Type[Type["Date"] = 6] = "Date";
    Type[Type["String"] = 7] = "String";
})(Type || (Type = {}));
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
    // empty
    if (!value || value === "undefined") {
        return Type.Undefined;
    }
    if (value === "null") {
        return Type.Null;
    }
    if (value === "NaN") {
        return Type.NaN;
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
        case Type.NaN:
            return NaN;
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
    return String(value);
}
function parseQueryString({ queryString, paramTypeMap, autoInferType = true, }) {
    const ret = {};
    queryString = queryString.replace(/^\?/, "");
    const paramPairs = queryString.split("&");
    for (const pair of paramPairs) {
        const [key, value] = pair.split("=").map(decodeURIComponent);
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
function buildQueryString({ params, encodeURI = true, }) {
    return ("?" +
        Object.keys(params)
            .map((key) => {
            let value = stringifyValue(params[key]);
            value = encodeURI ? encodeURIComponent(value) : value;
            return `${key}=${value}`;
        })
            .join("&"));
}
exports.buildQueryString = buildQueryString;
function overrideUrl({ url, params, }) {
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
    const queryString = buildQueryString({ params: oldParams, encodeURI: false });
    const ret = `${domain}${pathname}${queryString}${hash}`;
    return ret;
}
exports.overrideUrl = overrideUrl;
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
