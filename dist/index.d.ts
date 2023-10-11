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
export declare function buildQueryString({ params, encodeURI, }: {
    params: {
        [key: string]: any;
    };
    encodeURI?: Boolean;
}): string;
export declare function overrideUrl({ url, params, }: {
    url: string;
    params: {
        [key: string]: any;
    };
}): string;
