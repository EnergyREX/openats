export enum HttpClientBaseMethod {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
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
        params?: Record<string, string>,
        body?: Record<string, unknown>
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
                "Content-Type": 'application/json',
                ...this.defaultHeaders
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(900_000)
        })

        if (!res.ok) {
            const errorBody = await res.json() 
            throw new Error(`HTTP ${res.status}: ${JSON.stringify(errorBody)}`)
        }

        return res.json() as Promise<T>

        
    }

    private buildUrl( endpoint: string, params?: Record<string, string>): string {
        const url = new URL(`${this.baseUrl}/${endpoint}`)

        if (params) {
            const p = Object.entries(params)
            p.forEach(param => {
                url.searchParams.append(param[0], param[1])
            });
        } 
        
        return url.toString()
    }

    public async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        // Execute request and just return whatever it returns.
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.GET, params)
        return data
    }

    public async post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.POST, undefined, body )
        return data
    }

    public async patch<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
        // Execute request and just return whatever it returns.
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.PATCH, undefined, body)
        return data
    }

    public async put<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
        // Execute request and just return whatever it returns.
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.PUT, undefined, body)
        return data
    }

    public async delete<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
        // Execute request and just return whatever it returns.
        const data = await this.request<T>(endpoint, HttpClientBaseMethod.DELETE, undefined, body)
        return data

    }
}