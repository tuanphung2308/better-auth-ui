import type { FetchError } from "./fetch-error"

type MutateFn<T = Record<string, unknown>> = (params: T) => Promise<{ error?: FetchError | null }>

export interface AuthMutates {
    deletePasskey: MutateFn<{ id: string }>
    revokeDeviceSession: MutateFn<{ sessionToken: string }>
    revokeSession: MutateFn<{ token: string }>
    setActiveSession: MutateFn<{ sessionToken: string }>
    updateUser: MutateFn
    unlinkAccount: MutateFn<{ providerId: string; accountId?: string }>
}
