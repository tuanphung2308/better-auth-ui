import { useContext, useEffect } from "react"
import { useCurrentOrganization } from "../hooks/use-current-organization"
import { AuthUIContext } from "./auth-ui-provider"

export const OrganizationRefetcher = () => {
    const {
        hooks,
        organization: organizationOptions,
        navigate,
        redirectTo
    } = useContext(AuthUIContext)
    const { data: sessionData } = hooks.useSession()

    const { slug, slugPaths, personalPath } = organizationOptions || {}

    const { data: organization, isPending: organizationPending } =
        useCurrentOrganization()

    const {
        data: organizations,
        refetch: refetchListOrganizations,
        isRefetching: organizationsRefetching
    } = hooks.useListOrganizations()

    // biome-ignore lint/correctness/useExhaustiveDependencies: Refetch fix
    useEffect(() => {
        if (!sessionData?.user.id) return
        if (organizations) refetchListOrganizations?.()
    }, [sessionData?.user.id, refetchListOrganizations])

    useEffect(() => {
        if (organizationsRefetching || organizationPending) return

        if (slug && slugPaths && !organization) {
            navigate(personalPath || redirectTo)
        }
    }, [
        organization,
        organizationsRefetching,
        organizationPending,
        slug,
        slugPaths,
        personalPath,
        navigate,
        redirectTo
    ])

    return null
}
