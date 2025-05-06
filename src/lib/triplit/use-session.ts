import { useQueryOne } from "@triplit/react"

import type { User } from "../../types/auth-client"
import type { AuthHooks } from "../../types/auth-hooks"
import { getModelName } from "./model-names"
import type { UseTriplitOptionsProps } from "./use-triplit-hooks"

export function useSession({
    triplit,
    sessionData,
    isPending,
    refetch,
    usePlural,
    modelNames
}: UseTriplitOptionsProps): ReturnType<AuthHooks["useSession"]> {
    const modelName = getModelName({
        namespace: "user",
        modelNames,
        usePlural
    })

    const { result: user } = useQueryOne(triplit, triplit.query(modelName))

    return {
        data: sessionData
            ? {
                  session: sessionData.session,
                  user: (sessionData?.user.id === user?.id ? user : sessionData.user) as User
              }
            : undefined,
        isPending: isPending,
        refetch
    }
}
