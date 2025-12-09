interface HttpResponse {
    json(): any;
    text(): string;
}

interface iFetchOptions {
    method?: string;
    proxy?: string;
    headers?: Record<string, string>;
    body?: string | null;
    timeout?: number;
}

declare function iFetch(url: string, options?: iFetchOptions): Promise<HttpResponse>;
export default iFetch;