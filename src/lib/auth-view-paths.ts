export const authViewPaths = {
    /** @default "accept-invitation" */
    acceptInvitation: "accept-invitation",
    /** @default "api-keys" */
    apiKeys: "api-keys",
    /** @default "callback" */
    callback: "callback",
    /** @default "email-otp" */
    emailOTP: "email-otp",
    /** @default "forgot-password" */
    forgotPassword: "forgot-password",
    /** @default "magic-link" */
    magicLink: "magic-link",
    /** @default "members" */
    members: "members",
    /** @default "organization" */
    organization: "organization",
    /** @default "organizations" */
    organizations: "organizations",
    /** @default "recover-account" */
    recoverAccount: "recover-account",
    /** @default "reset-password" */
    resetPassword: "reset-password",
    /** @default "security" */
    security: "security",
    /** @default "settings" */
    settings: "settings",
    /** @default "sign-in" */
    signIn: "sign-in",
    /** @default "sign-out" */
    signOut: "sign-out",
    /** @default "sign-up" */
    signUp: "sign-up",
    /** @default "two-factor" */
    twoFactor: "two-factor"
}

export type AuthViewPaths = typeof authViewPaths
export type AuthView = keyof AuthViewPaths
