export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60

export const RATE_LIMIT_AUTH = { limit: 10, windowMs: 60_000 }
export const RATE_LIMIT_LINK = { limit: 30, windowMs: 60_000 }

export const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None" as const,
    path: "/",
}
