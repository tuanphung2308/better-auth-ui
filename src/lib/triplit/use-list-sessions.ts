import type { Session } from "better-auth"
import { useMemo } from "react"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import { useConditionalQuery } from "./use-conditional-query"
import type { UseTriplitOptionsProps } from "./use-triplit-hooks"
import { useTriplitToken } from "./use-triplit-token"

export function useListSessions({
    triplit,
    modelNames,
    usePlural,
    isPending
}: UseTriplitOptionsProps): ReturnType<AuthHooks["useListSessions"]> {
    const modelName = getModelName({
        namespace: "session",
        modelNames,
        usePlural
    })

    const { payload } = useTriplitToken({ triplit })
    const now = useMemo(() => Date.now(), [])

    const {
        results: sessions,
        error,
        fetching
    } = useConditionalQuery(
        triplit,
        payload?.sub && triplit.query(modelName).Where("expiresAt", ">=", now)
    )

    return {
        data: sessions as Session[],
        isPending: isPending || fetching,
        error
    }
}
