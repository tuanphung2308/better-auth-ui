import { useCallback, useContext, useEffect, useState, useTransition } from "react"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { getSearchParam } from "../../../lib/utils"

export function useOnSuccessTransition({ redirectTo: propsRedirectTo }: { redirectTo?: string }) {
    const { redirectTo: contextRedirectTo } = useContext(AuthUIContext)

    const getRedirectTo = useCallback(
        () => propsRedirectTo || getSearchParam("redirectTo") || contextRedirectTo,
        [propsRedirectTo, contextRedirectTo]
    )

    const [isPending, startTransition] = useTransition()
    const [success, setSuccess] = useState(false)

    const {
        navigate,
        hooks: { useSession },
        onSessionChange
    } = useContext(AuthUIContext)

    const { refetch: refetchSession } = useSession()

    useEffect(() => {
        if (!success || isPending) return

        startTransition(() => navigate(getRedirectTo()))
    }, [success, isPending, navigate, getRedirectTo])

    const onSuccess = async () => {
        await refetchSession?.()
        setSuccess(true)

        if (onSessionChange) startTransition(onSessionChange)
    }

    return { onSuccess, isPending }
}
