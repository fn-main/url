export declare function parseQueryString({ queryString, paramTypeMap, autoInferType, }: {
    queryString: string;
    paramTypeMap?: {
        [key: string]: string;
    };
    autoInferType?: boolean;
}): {
    [key: string]: any;
};
export declare function parseUrlParams({ url, paramTypeMap, autoInferType, }: {
    url: string;
    paramTypeMap?: {
        [key: string]: string;
    };
    autoInferType?: boolean;
}): {
    [key: string]: any;
};
export declare function buildQueryString({ params, encodeURI, removeEmptyParams, sort, }: {
    params: {
        [key: string]: any;
    };
    encodeURI?: Boolean;
    removeEmptyParams?: Boolean;
    sort?: Boolean;
}): string;
export declare function overrideUrl({ url, params, encodeURI, removeEmptyParams, sort, }: {
    url: string;
    params: {
        [key: string]: any;
    };
    encodeURI?: Boolean;
    removeEmptyParams?: Boolean;
    sort?: Boolean;
}): string;
export declare function removeUrlParams(url: string, params: string[] | Record<string, any>): string;
export declare function parseUrl(url: string): {
    domain: string;
    pathname: string;
    search: string;
    hash: string;
};
export declare function encodeMiniProgramWebviewUrl(webviewUrl: string): string;
export declare function decodeMiniProgramWebviewUrl(webviewUrl: string): string;
export declare function joinPath(...segments: string[]): string;
export declare function isEncoded(str: string): boolean;
export declare function safeEncodeURIComponent(str: string): string;
export declare function safeDecodeURIComponent(str: string): string;
export declare function safeEncodeURI(str: string): string;
export declare function safeDecodeURI(str: string): string;
//# sourceMappingURL=index.d.ts.map