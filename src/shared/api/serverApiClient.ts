import { cookies } from "next/headers";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api`;

async function serverRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
    const cookieStore = await cookies();

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "x-platform": "web",
            Cookie: cookieStore.toString(),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    if (!res.ok) throw new Error(res.statusText);

    return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>);
}

export const serverApiClient = {
    get:    <T>(path: string)                  => serverRequest<T>(path, "GET"),
    post:   <T>(path: string, body?: unknown)  => serverRequest<T>(path, "POST", body),
    patch:  <T>(path: string, body?: unknown)  => serverRequest<T>(path, "PATCH", body),
    put:    <T>(path: string, body?: unknown)  => serverRequest<T>(path, "PUT", body),
    delete: <T>(path: string)                  => serverRequest<T>(path, "DELETE"),
};
