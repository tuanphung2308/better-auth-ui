import { useQuery } from "@triplit/react"
import type { Session } from "better-auth"
import { useMemo } from "react"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import type { UseTriplitOptionsProps } from "./use-triplit-hooks"

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

    const now = useMemo(() => Date.now(), [])

    const {
        results: sessions,
        error,
        fetching
    } = useQuery(triplit, triplit.query(modelName).Where("expiresAt", ">=", now))

    return {
        data: sessions as Session[],
        isPending: !sessions && (isPending || fetching),
        error
    }
}
