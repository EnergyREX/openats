import { HttpClient, HttpError } from "../HttpClient";

interface LoginPayload {
    email: string,
    password: string
}

type LoginResponse =
    | {
        "success": true
        "message": string
        "token": string
        "data": { "uuid": string; "email": string }
      }
    | {
        "success": false
        "error": { "message": string; "code": string }
      }

type LogoutResponse =
    | {
        "success": true,
        "message": string
    }
    | {
        "success": false,
        "error": {
            "message": string,
            "code": string
        }
    }

type RefreshResponse =
    | {
        "success": true,
        "token": string
    }
    | {
        "success": false,
        "error": {
            "message": string,
            "code": string
        }
    }

export type AuthResult =
    | { ok: true }
    | { ok: false; error: string }

const backendURL = process.env.NEXT_PUBLIC_API_URL
const HttpClientInstance = new HttpClient(backendURL ?? 'http://localhost:6500',
    {
        'Content-Type': 'application/json',
    }
)

function errorFromHttp(err: unknown): string {
    if (err instanceof HttpError) {
        const body = err.body as { error?: { message?: string }; message?: string } | undefined
        return body?.error?.message ?? body?.message ?? err.message
    }
    return 'Error de red'
}

export async function login(data: LoginPayload): Promise<AuthResult> {
    try {
        const result = await HttpClientInstance.post<LoginResponse>('api/v1/login', {
            email: data.email,
            password: data.password
        }, {},
        { credentials: "include" })

        if (!result.success) return { ok: false, error: result.error.message }

        localStorage.setItem('accessToken', result.token)
        localStorage.setItem('user_email', result.data.email)
        return { ok: true }
    } catch (err) {
        return { ok: false, error: errorFromHttp(err) }
    }
}

export async function refresh(): Promise<RefreshResponse | undefined> {
    try {
        const result = await HttpClientInstance.post<RefreshResponse>('api/v1/refresh', {}, {}, { credentials: "include" })
        if (!result.success) return result
        localStorage.setItem('accessToken', result.token)
        return result
    } catch {
        return undefined
    }
}

export async function logout(): Promise<LogoutResponse | undefined> {
    try {
        const result = await HttpClientInstance.post<LogoutResponse>('api/v1/logout', {}, {}, { credentials: "include" })
        return result
    } catch {
        return undefined
    } finally {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user_email')
    }
}
