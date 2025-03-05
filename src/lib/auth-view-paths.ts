export const authViewPaths = {
    callback: "callback",
    forgotPassword: "forgot-password",
    magicLink: "magic-link",
    resetPassword: "reset-password",
    settings: "settings",
    signIn: "sign-in",
    signOut: "sign-out",
    signUp: "sign-up",
}

export type AuthView = keyof typeof authViewPaths