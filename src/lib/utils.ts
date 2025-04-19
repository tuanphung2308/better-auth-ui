import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AuthLocalization } from "./auth-localization"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function isValidEmail(email: string) {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Converts error codes from SNAKE_CASE to camelCase
 * Example: INVALID_TWO_FACTOR_COOKIE -> invalidTwoFactorCookie
 */
export function errorCodeToCamelCase(errorCode: string): string {
    return errorCode.toLowerCase().replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

/**
 * Gets a localized error message from an error object
 * Uses getErrorMessage internally but adds localization fallback
 */
export function getLocalizedError({
    error,
    localization
}: {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    error: any
    localization?: Partial<AuthLocalization>
}) {
    if (error?.error) {
        if (error.error.code) {
            const camelCaseErrorCode = errorCodeToCamelCase(
                error.error.code
            ) as keyof AuthLocalization
            if (localization?.[camelCaseErrorCode]) return localization[camelCaseErrorCode]
        }

        return (
            error.error.message ||
            error.error.code ||
            error.error.statusText ||
            localization?.requestFailed
        )
    }

    return error?.message || localization?.requestFailed || "Request failed"
}
