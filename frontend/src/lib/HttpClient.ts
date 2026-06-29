export enum HttpClientBaseMethod {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        public readonly body: unknown,
        message?: string
    ) { 
        super(message ?? `HTTP Error ${status}`)
    }
}

export class HttpClient {
    private baseUrl: string
    private defaultHeaders: Record<string, string>

    constructor(baseUrl: string, defaultHeaders: Record<string, string>) {
        this.baseUrl = baseUrl
        this.defaultHeaders = defaultHeaders
    }

    private async request<T>( 
        endpoint: string,
        method: HttpClientBaseMethod,
        headers?: Record<string, string>,
        params?: Record<string, string>,
        body?: Record<string, unknown>,
        options?: Record<string, string>
    ): Promise<T> {
        let url

        if (params) {
            url = this.buildUrl(endpoint, params)
        } else {
            url = this.buildUrl(endpoint)
        }

        const res = await fetch(url, {
            method: method,
            headers: {
                ...this.defaultHeaders,
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            ...options
        })

        if (!res.ok) {
            let errorBody: unknown
            try {
                errorBody = await res.json()
            } catch {
                errorBody = await res.text()
            }
            throw new HttpError(res.status, errorBody)
        }

        return res.json() as Promise<T>

        
    }

    private buildUrl(endpoint: string, params?: Record<string, string>): string {
        const url = new URL(`${this.baseUrl}/${endpoint}`)

        if (params) {
            const p = Object.entries(params)
            p.forEach(param => {
                url.searchParams.append(param[0], param[1])
            });
        } 
        
        return url.toString()
    }

    public async get<T>(
        endpoint: string, 
        headers?: Record<string, string>, 
        params?: Record<string, string>,
        options?: Record<string, string>): Promise<T> {
        // GET requests must not carry a body; passing `{}` would be truthy and
        // make fetch throw "Request with GET/HEAD method cannot have body".
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.GET, headers, params, undefined, options)
        return data

    }

    public async post<T>(
        endpoint: string, 
        body: Record<string, unknown>,
        headers?: Record<string, string>, 
        options?: Record<string, string>): Promise<T> {
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.POST, headers, undefined, body, options)
        return data
    }

    public async patch<T>(        
        endpoint: string, 
        body: Record<string, unknown>,
        headers?: Record<string, string>, 
        options?: Record<string, string>): Promise<T> {
        // Execute request and just return whatever it returns.
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.PATCH, headers, undefined, body, options)
        return data
    }

    public async put<T>(        
        endpoint: string, 
        body: Record<string, unknown>,
        headers?: Record<string, string>, 
        options?: Record<string, string>): Promise<T> {
        // Execute request and just return whatever it returns.
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.PUT, headers, undefined, body, options)
        return data
    }

    public async delete<T>(
        endpoint: string, 
        body: Record<string, unknown>,
        headers?: Record<string, string>, 
        options?: Record<string, string>
    ): Promise<T> {
        // Execute request and just return whatever it returns.
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.DELETE, headers, undefined, body, options)
        return data

    }
}