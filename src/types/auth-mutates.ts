// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type MutateFn<T = Record<string, unknown>> = (params: T) => Promise<any>

export interface AuthMutates {
    deletePasskey: MutateFn<{ id: string }>
    revokeDeviceSession: MutateFn<{ sessionToken: string }>
    revokeSession: MutateFn<{ token: string }>
    setActiveSession: MutateFn<{ sessionToken: string }>
    updateUser: MutateFn
    unlinkAccount: MutateFn<{ providerId: string; accountId?: string }>
}
