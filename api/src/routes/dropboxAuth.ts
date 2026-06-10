import { Hono } from "hono"
import { deleteCookie, setSignedCookie, getSignedCookie } from "hono/cookie"
import { rateLimit } from "../middleware/rateLimit"
import {
    cookieOptions,
    REFRESH_TOKEN_MAX_AGE,
    RATE_LIMIT_AUTH,
} from "../lib/constants"

const dropboxAuth = new Hono()

dropboxAuth.use("*", rateLimit(RATE_LIMIT_AUTH.limit, RATE_LIMIT_AUTH.windowMs))

const DROPBOX_TOKEN_URL = "https://api.dropboxapi.com/oauth2/token"
const DROPBOX_USER_URL =
    "https://api.dropboxapi.com/2/users/get_current_account"

dropboxAuth.post("/callback", async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.code || !body?.code_verifier || !body?.redirect_uri) {
        return c.json(
            {
                error: "Missing code or code_verifier",
                error_code: "invalid_request",
            },
            400,
        )
    }

    const res = await fetch(DROPBOX_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code: body.code,
            client_id: process.env.DROPBOX_APP_KEY!,
            client_secret: process.env.DROPBOX_APP_SECRET!,
            code_verifier: body.code_verifier,
            redirect_uri: body.redirect_uri,
            grant_type: "authorization_code",
        }),
    })

    const data = (await res.json()) as Record<string, string>

    if (!res.ok || data["error"]) {
        return c.json(
            {
                error: data["error_description"] ?? "Token exchange failed",
                error_code: data["error"] ?? "oauth_error",
            },
            400,
        )
    }

    const userRes = await fetch(DROPBOX_USER_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${data["access_token"]}` },
    })

    if (!userRes.ok) {
        return c.json(
            {
                error: "Failed to fetch user info",
                error_code: "userinfo_error",
            },
            400,
        )
    }

    const userInfo = (await userRes.json()) as Record<string, string>

    if (data["refresh_token"]) {
        await setSignedCookie(
            c,
            "dropbox_refresh_token",
            data["refresh_token"],
            process.env.SESSION_SECRET!,
            {
                ...cookieOptions,
                maxAge: REFRESH_TOKEN_MAX_AGE,
            },
        )
    }

    const expiresAt = new Date(
        Date.now() + Number(data["expires_in"]) * 1000,
    ).toISOString()

    return c.json({
        accessToken: data["access_token"],
        expiresAt,
        email: userInfo["email"],
    })
})

dropboxAuth.post("/refresh", async (c) => {
    const refreshToken = await getSignedCookie(
        c,
        process.env.SESSION_SECRET!,
        "dropbox_refresh_token",
    )
    if (!refreshToken) {
        return c.json(
            { error: "No refresh token", error_code: "no_refresh_token" },
            401,
        )
    }

    const res = await fetch(DROPBOX_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: process.env.DROPBOX_APP_KEY!,
            client_secret: process.env.DROPBOX_APP_SECRET!,
            grant_type: "refresh_token",
        }),
    })

    const data = (await res.json()) as Record<string, string>

    if (!res.ok || data["error"]) {
        return c.json(
            {
                error: data["error_description"] ?? "Token refresh failed",
                error_code: data["error"] ?? "refresh_error",
            },
            400,
        )
    }

    const expiresAt = new Date(
        Date.now() + Number(data["expires_in"]) * 1000,
    ).toISOString()

    return c.json({
        accessToken: data["access_token"],
        expiresAt,
    })
})

dropboxAuth.post("/logout", (c) => {
    deleteCookie(c, "dropbox_refresh_token", { path: "/" })
    return c.json({ ok: true })
})

export default dropboxAuth
