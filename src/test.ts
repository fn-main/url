import {
  buildQueryString,
  decodeMiniProgramWebviewUrl,
  encodeMiniProgramWebviewUrl,
  overrideUrl,
  parseQueryString,
  parseUrl,
  parseUrlParams,
  removeUrlParams,
  safeDecodeURI,
  safeDecodeURIComponent,
  safeEncodeURI,
  safeEncodeURIComponent,
} from "./index";

const urlWithoutDomain = parseUrl("/a/b?q=1#hash");
console.log(urlWithoutDomain);

let url =
  'https://domain/path?percent=%1&str=str&num=21&json={"a":1}&arr=[1,"two",3]&fakeJson={x:x}&bool1=true&bool2=false&date=2020-01-01T00:00:00.000Z&undefined=undefined&null=null&empty=#hash';

let params = parseUrlParams({ url });
console.log("parseUrlParams", JSON.stringify(params, null, 4));

url = overrideUrl({
  url,
  params: { json: { a: 2 }, arr: ["one", 2], date: new Date("2020-1-1") },
});
console.log("overrideUrl", url);

console.log("-----------------------");
console.log("default Not encodeURI");
url = overrideUrl({
  url,
  params: { zh: "中文" },
});
console.log("overrideUrl", url);

console.log("encodeURI");
url = overrideUrl({
  url,
  params: { zh: "中文" },
  encodeURI: true,
});
console.log("overrideUrl", url);

console.log("-----------------------");
console.log("default Not removeEmptyParams");
url = overrideUrl({
  url,
  params: { undefined: undefined, null: null, empty: "" },
});

console.log("overrideUrl", url);
console.log("removeEmptyParams");
url = overrideUrl({
  url,
  params: { undefined: undefined, null: null, empty: "" },
  removeEmptyParams: true,
});
console.log("overrideUrl", url);

url = removeUrlParams(url, ["str", "num"]);
console.log("removeUrlParams", url);
url = removeUrlParams(url, { json: true });
console.log("removeUrlParams", url);

url = "https://fnmain.com/";
url = overrideUrl({ url, params: { token: "token" } });
console.log(url);

url = "https://fnmain.com/?a=1&b=2";
url = encodeMiniProgramWebviewUrl(url);
console.log(url);
url = decodeMiniProgramWebviewUrl(url);
console.log(url);

console.log("parseUrl", parseUrl(url));

console.log(
  "sort",
  overrideUrl({ url: "https://example.com?c=3", params: { b: 2, a: 1 }, sort: true })
);

function assert(actual: string, expected: string, message: string) {
  if (actual !== expected) {
    console.error(`❌ ${message}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual:   ${actual}`);
  } else {
    console.log(`✅ ${message}`);
  }
}

console.log("Testing URL encoding and decoding functions:");

// Test safeEncodeURI
console.log("\nTesting safeEncodeURI:");
assert(
  safeEncodeURI("https://example.com/path with spaces"),
  "https://example.com/path%20with%20spaces",
  "Unencoded string should be properly encoded"
);
assert(
  safeEncodeURI("https://example.com/path%20with%20spaces"),
  "https://example.com/path%20with%20spaces",
  "Already encoded string should not change"
);
assert(
  safeEncodeURI("https://example.com/path?key=value&special=!@#$%^&*()"),
  "https://example.com/path?key=value&special=!@#$%25%5E&*()",
  "Special characters should be properly encoded"
);

// Test safeDecodeURI
console.log("\nTesting safeDecodeURI:");
assert(
  safeDecodeURI("https://example.com/path%20with%20spaces"),
  "https://example.com/path with spaces",
  "Encoded string should be properly decoded"
);
assert(
  safeDecodeURI("https://example.com/path with spaces"),
  "https://example.com/path with spaces",
  "Unencoded string should not change"
);
assert(
  safeDecodeURI("https://example.com/invalid%2G"),
  "https://example.com/invalid%2G",
  "Invalid encoding should not change"
);

// Test safeEncodeURIComponent
console.log("\nTesting safeEncodeURIComponent:");
assert(
  safeEncodeURIComponent("key=value&special=!@#$%^&*()"),
  "key%3Dvalue%26special%3D!%40%23%24%25%5E%26*()",
  "Unencoded string should be properly encoded"
);
assert(
  safeEncodeURIComponent("key%3Dvalue%26special%3D!%40%23%24%25%5E%26*()"),
  "key%3Dvalue%26special%3D!%40%23%24%25%5E%26*()",
  "Already encoded string should not change"
);
assert(
  safeEncodeURIComponent("Hello World!"),
  "Hello%20World!",
  "Special characters should be properly encoded"
);

// Test safeDecodeURIComponent
console.log("\nTesting safeDecodeURIComponent:");
assert(
  safeDecodeURIComponent("key%3Dvalue%26special%3D!%40%23%24%25%5E%26*()"),
  "key=value&special=!@#$%^&*()",
  "Encoded string should be properly decoded"
);
assert(
  safeDecodeURIComponent("key=value&special=!@#$%^&*()"),
  "key=value&special=!@#$%^&*()",
  "Unencoded string should not change"
);
assert(
  safeDecodeURIComponent("invalid%2Gencoding"),
  "invalid%2Gencoding",
  "Invalid encoding should not change"
);

function testParseQueryString() {
  console.log("\nTesting parseQueryString:");
  // Test basic functionality
  assert(
    JSON.stringify(parseQueryString({ queryString: "a=1&b=2" })),
    JSON.stringify({ a: 1, b: 2 }),
    "Basic parsing with numbers"
  );

  // Test with different types
  assert(
    JSON.stringify(
      parseQueryString({
        queryString: 'str=hello&num=42&bool=true&json={"key":"value"}&date=2023-04-14T12:00:00Z',
      })
    ),
    JSON.stringify({
      str: "hello",
      num: 42,
      bool: true,
      json: { key: "value" },
      date: new Date("2023-04-14T12:00:00Z"),
    }),
    "Parsing different types with auto inference"
  );

  // Test with empty values
  assert(
    JSON.stringify(parseQueryString({ queryString: "empty=&null=null&undefined=undefined" })),
    JSON.stringify({ empty: "", null: null, undefined: undefined }),
    "Parsing empty, null, and undefined values"
  );

  // Test with encoded values
  assert(
    JSON.stringify(
      parseQueryString({
        queryString: "encoded=hello%20world&special=%21%40%23%24%25%5E%26*%28%29",
      })
    ),
    JSON.stringify({ encoded: "hello world", special: "!@#$%^&*()" }),
    "Parsing encoded values"
  );

  // Test with paramTypeMap
  assert(
    JSON.stringify(
      parseQueryString({
        queryString: "forceString=42&forceNumber=abc",
        paramTypeMap: { forceString: "string", forceNumber: "number" },
        autoInferType: false,
      })
    ),
    JSON.stringify({ forceString: "42", forceNumber: NaN }),
    "Parsing with paramTypeMap"
  );

  // Test with autoInferType set to false
  assert(
    JSON.stringify(
      parseQueryString({
        queryString: 'num=42&bool=true&json={"key":"value"}',
        autoInferType: false,
      })
    ),
    JSON.stringify({ num: "42", bool: "true", json: '{"key":"value"}' }),
    "Parsing without type inference"
  );

  // Test with raw Chinese
  assert(
    JSON.stringify(
      parseQueryString({
        queryString: "zh=中文",
      })
    ),
    JSON.stringify({ zh: "中文" }),
    "Parsing with raw Chinese"
  );

  // Test with raw encoded Chinese
  assert(
    JSON.stringify(
      parseQueryString({
        queryString: "zh=%E4%B8%AD%E6%96%87",
      })
    ),
    JSON.stringify({ zh: "中文" }),
    "Parsing with encodedChinese"
  );

  console.log("All parseQueryString tests passed!");
}

testParseQueryString();
