import type { FetchError } from "../types/fetch-error"

/**
 * Extracts an error message from any error object, with specific handling for FetchError
 */
export function getErrorMessage(error: unknown): string | undefined {
    if (!error) return undefined

    // Handle Error objects
    if (error instanceof Error) {
        return error.message
    }

    // Handle FetchError objects
    const fetchError = error as FetchError
    return fetchError.message || fetchError.statusText
}
