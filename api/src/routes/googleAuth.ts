import { Hono } from "hono"
import { deleteCookie, setSignedCookie, getSignedCookie } from "hono/cookie"
import { rateLimit } from "../middleware/rateLimit"
import {
    cookieOptions,
    REFRESH_TOKEN_MAX_AGE,
    RATE_LIMIT_AUTH,
} from "../lib/constants"

const googleAuth = new Hono()

googleAuth.use("*", rateLimit(RATE_LIMIT_AUTH.limit, RATE_LIMIT_AUTH.windowMs))

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USER_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

googleAuth.post("/callback", async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.code || !body?.redirect_uri) {
        return c.json(
            {
                error: "Missing code or redirect_uri",
                error_code: "invalid_request",
            },
            400,
        )
    }

    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code: body.code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: body.redirect_uri,
            grant_type: "authorization_code",
        }),
    })

    const data = (await res.json()) as Record<string, string>

    if (!res.ok || data["error"]) {
        return c.json(
            {
                error: data["error_description"] ?? "OAuth exchange failed",
                error_code: data["error"] ?? "oauth_error",
            },
            400,
        )
    }

    const userRes = await fetch(GOOGLE_USER_URL, {
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
            "google_refresh_token",
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

googleAuth.post("/refresh", async (c) => {
    const refreshToken = await getSignedCookie(
        c,
        process.env.SESSION_SECRET!,
        "google_refresh_token",
    )
    if (!refreshToken) {
        return c.json(
            { error: "No refresh token", error_code: "no_refresh_token" },
            401,
        )
    }

    const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
        }),
    })

    const data = (await res.json()) as Record<string, string>

    if (data["error"] === "invalid_grant") {
        deleteCookie(c, "google_refresh_token", { path: "/" })
    }

    if (!res.ok || data["error"]) {
        return c.json(
            {
                error: data["error_description"] ?? "Token refresh failed",
                error_code: data["error"] ?? "refresh_error",
            },
            400,
        )
    }

    if (data["refresh_token"]) {
        await setSignedCookie(
            c,
            "google_refresh_token",
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
    })
})

googleAuth.post("/logout", (c) => {
    deleteCookie(c, "google_refresh_token", { path: "/" })
    return c.json({ ok: true })
})

export default googleAuth
