export const authViews = ["sign-in", "sign-up", "sign-out", "magic-link", "forgot-password", "reset-password"] as const
export type AuthView = typeof authViews[number]