"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
let url = 'https://domain/path?str=str&num=21&json={"a":1}&arr=[1,"two",3]&fakeJson={x:x}&bool=true&date=2020-01-01T00:00:00.000Z&undefined=&null=null&NaN=NaN#hash';
let params = (0, index_1.parseUrlParams)({ url });
console.log("parseUrlParams", JSON.stringify(params, null, 4));
url = (0, index_1.overrideUrl)({
    url,
    params: { str: "newStr", json: { a: 2 }, arr: ["one", 2], date: new Date("2020-1-1") },
});
console.log("overrideUrl", url);
params = (0, index_1.parseUrlParams)({ url });
console.log("parseUrlParams", JSON.stringify(params, null, 4));
