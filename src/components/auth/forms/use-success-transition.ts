import { useContext, useEffect, useState, useTransition } from "react"
import { useSearchParam } from "../../../hooks/use-search-param"
import { AuthUIContext } from "../../../lib/auth-ui-provider"

export function useOnSuccessTransition({ redirectTo }: { redirectTo?: string }) {
    const { redirectTo: contextRedirectTo } = useContext(AuthUIContext)
    const redirectToParam = useSearchParam("redirectTo")

    redirectTo = redirectTo || redirectToParam || contextRedirectTo

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

        startTransition(() => navigate(redirectTo))
    }, [success, isPending, navigate, redirectTo])

    const onSuccess = async () => {
        await refetchSession?.()
        setSuccess(true)

        if (onSessionChange) startTransition(onSessionChange)
    }

    return { onSuccess, isPending }
}
