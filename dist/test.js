"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
let url = 'https://domain/path?percent=%1&str=str&num=21&json={"a":1}&arr=[1,"two",3]&fakeJson={x:x}&bool=true&date=2020-01-01T00:00:00.000Z&undefined=undefined&null=null&empty=#hash';
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
url = (0, index_1.removeUrlParams)(url, ["str", "num"]);
console.log("removeUrlParams", url);
url = (0, index_1.removeUrlParams)(url, { json: true });
console.log("removeUrlParams", url);
url = "https://fnmain.com/";
url = (0, index_1.overrideUrl)({ url, params: { token: "token" } });
console.log(url);
url = "https://fnmain.com/?a=1&b=2";
url = (0, index_1.encodeMiniProgramWebviewUrl)(url);
console.log(url);
url = (0, index_1.decodeMiniProgramWebviewUrl)(url);
console.log(url);
console.log("parseUrl", (0, index_1.parseUrl)(url));
//# sourceMappingURL=test.js.map