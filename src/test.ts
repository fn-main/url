import { overrideUrl, parseQueryString, parseUrlParams } from "./index";

let url =
  'https://domain/path?str=str&num=21&json={"a":1}&arr=[1,"two",3]&fakeJson={x:x}&bool=true&date=2020-01-01T00:00:00.000Z&undefined=&null=null&NaN=NaN#hash';

let params = parseUrlParams({ url });
console.log("parseUrlParams", JSON.stringify(params, null, 4));

url = overrideUrl({ url, params: { new: "newStr" } });
console.log("overrideUrl", url);

params = parseUrlParams({ url });
console.log("parseUrlParams", JSON.stringify(params, null, 4));
