"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
let url = 'https://domain/path?str=中文&num=21&json={"a":1}&arr=[1,"two",3]&fakeJson={x:x}&bool=true&date=2020-01-01T00:00:00.000Z&undefined=undefined&null=null&empty=#hash';
let params = (0, index_1.parseUrlParams)({ url });
console.log("parseUrlParams", JSON.stringify(params, null, 4));
url = (0, index_1.overrideUrl)({
    url,
    params: { json: { a: 2 }, arr: ["one", 2], date: new Date("2020-1-1") },
});
console.log("overrideUrl", url);
console.log("-----------------------");
console.log("default Not encodeURI");
url = (0, index_1.overrideUrl)({
    url,
    params: { zh: "中文" },
});
console.log("overrideUrl", url);
console.log("encodeURI");
url = (0, index_1.overrideUrl)({
    url,
    params: { zh: "中文" },
    encodeURI: true,
});
console.log("overrideUrl", url);
console.log("-----------------------");
console.log("default Not removeEmptyParams");
url = (0, index_1.overrideUrl)({
    url,
    params: { undefined: undefined, null: null, empty: "" },
});
console.log("overrideUrl", url);
console.log("removeEmptyParams");
url = (0, index_1.overrideUrl)({
    url,
    params: { undefined: undefined, null: null, empty: "" },
    removeEmptyParams: true,
});
console.log("overrideUrl", url);
