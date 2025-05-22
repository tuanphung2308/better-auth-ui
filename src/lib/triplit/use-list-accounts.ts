import { useQuery } from "@triplit/react"
import { useMemo } from "react"

import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import type { UseTriplitOptionsProps } from "./use-triplit-hooks"

export function useListAccounts({
    triplit,
    modelNames,
    usePlural,
    isPending
}: UseTriplitOptionsProps): ReturnType<AuthHooks["useListAccounts"]> {
    const modelName = getModelName({
        namespace: "account",
        modelNames,
        usePlural
    })

    const { results, error, fetching } = useQuery(
        triplit,
        triplit.query(modelName).Where([!!triplit.token])
    )

    const accounts = useMemo(() => {
        return results?.map((account) => ({
            accountId: account.accountId as string,
            provider: account.providerId as string
        }))
    }, [results])

    return {
        data: accounts,
        isPending: !accounts && (isPending || fetching || !triplit.token),
        error
    }
}
