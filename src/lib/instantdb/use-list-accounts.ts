import { useMemo } from "react"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import type { UseInstantOptionsProps } from "./use-instant-options"

export function useListAccounts({
    db,
    modelNames,
    usePlural,
    useSession
}: UseInstantOptionsProps): ReturnType<AuthHooks["useListAccounts"]> {
    const { isPending } = useSession()
    const { user: authUser, isLoading: authLoading } = db.useAuth()

    const modelName = getModelName({
        namespace: "account",
        modelNames,
        usePlural
    })

    const { data, isLoading, error } = db.useQuery(
        authUser ? { [modelName]: { $: { where: { userId: authUser?.id } } } } : null
    )

    const accounts = useMemo(() => {
        if (data?.[modelName]) {
            return data[modelName].map((account) => ({
                accountId: account.accountId as string,
                provider: account.providerId as string
            }))
        }
    }, [data, modelName])

    return {
        data: accounts,
        isPending: isPending || authLoading || isLoading,
        error
    }
}
