"use client"
import { useContext, useEffect } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { SettingsCardsProps } from "../settings/settings-cards"
import { DeleteOrganizationCard } from "./delete-organization-card"
import { OrganizationLogoCard } from "./organization-logo-card"
import { OrganizationNameCard } from "./organization-name-card"
import { OrganizationSlugCard } from "./organization-slug-card"

export function OrganizationSettingsCards({
    className,
    classNames,
    localization
}: Omit<SettingsCardsProps, "view">) {
    const {
        authClient,
        basePath,
        hooks: { useActiveOrganization },
        organization,
        replace,
        viewPaths
    } = useContext(AuthUIContext)

    const { data: activeOrganization, isPending: organizationPending } = useActiveOrganization()

    useEffect(() => {
        if (organizationPending) return
        if (!activeOrganization) replace(`${basePath}/${viewPaths.settings}`)
    }, [activeOrganization, organizationPending, basePath, replace, viewPaths.settings])

    return (
        <div className={cn("flex w-full flex-col gap-4 md:gap-6", className, classNames?.cards)}>
            {organization?.logo && (
                <OrganizationLogoCard classNames={classNames?.card} localization={localization} />
            )}

            <OrganizationNameCard classNames={classNames?.card} localization={localization} />

            <OrganizationSlugCard classNames={classNames?.card} localization={localization} />

            <DeleteOrganizationCard classNames={classNames?.card} localization={localization} />
        </div>
    )
}
