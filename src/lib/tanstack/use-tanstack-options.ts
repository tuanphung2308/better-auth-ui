import { AuthQueryContext, createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { useQueryClient } from "@tanstack/react-query"
import type { createAuthClient } from "better-auth/react"
import { useContext } from "react"
import type { AuthHooks } from "../../types/auth-hooks"
import type { AuthMutates } from "../../types/auth-mutates"

export function useTanstackOptions({
    authClient
}: {
    authClient: Omit<ReturnType<typeof createAuthClient>, "signUp">
}) {
    const {
        useUnlinkAccount,
        useUpdateUser,
        useDeletePasskey,
        useRevokeSession,
        useRevokeDeviceSession,
        useSetActiveSession
    } = createAuthHooks(authClient)
    const queryClient = useQueryClient()

    const { mutateAsync: updateUserAsync } = useUpdateUser()
    const { mutateAsync: deletePasskeyAsync } = useDeletePasskey()
    const { mutateAsync: unlinkAccountAsync } = useUnlinkAccount()
    const { mutateAsync: revokeSessionAsync } = useRevokeSession()
    const { mutateAsync: revokeDeviceSessionAsync } = useRevokeDeviceSession()
    const { setActiveSessionAsync } = useSetActiveSession()
    const { sessionKey } = useContext(AuthQueryContext)

    const hooks: AuthHooks = createAuthHooks(authClient)

    const mutates: AuthMutates = {
        updateUser: (params) => updateUserAsync({ fetchOptions: { throw: false }, ...params }),
        unlinkAccount: (params) =>
            unlinkAccountAsync({ fetchOptions: { throw: false }, ...params }),
        deletePasskey: (params) =>
            deletePasskeyAsync({ fetchOptions: { throw: false }, ...params }),
        revokeSession: (params) =>
            revokeSessionAsync({ fetchOptions: { throw: false }, ...params }),
        setActiveSession: (params) =>
            setActiveSessionAsync({ fetchOptions: { throw: false }, ...params }),
        revokeDeviceSession: (params) =>
            revokeDeviceSessionAsync({ fetchOptions: { throw: false }, ...params })
    }

    const onSessionChange = async () => {
        await queryClient.refetchQueries({ queryKey: sessionKey })

        setTimeout(() =>
            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey !== sessionKey
            })
        )
    }

    return {
        hooks,
        mutates,
        onSessionChange,
        optimistic: true
    }
}
