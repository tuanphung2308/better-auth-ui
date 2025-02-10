export const authViews = ["login", "signup", "logout", "magic-link", "forgot-password", "reset-password"] as const
export type AuthView = typeof authViews[number]