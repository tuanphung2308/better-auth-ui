"use client"

import { useContext, useEffect } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"

import { DeleteOrganizationCard } from "./delete-organization-card"
import { OrganizationLogoCard } from "./organization-logo-card"
import { OrganizationNameCard } from "./organization-name-card"
import { OrganizationSlugCard } from "./organization-slug-card"

export type OrganizationSettingsCardsProps = {
    className?: string
    classNames?: {
        card?: SettingsCardClassNames
        cards?: string
    }
    localization?: Partial<AuthLocalization>
}

export function OrganizationSettingsCards({
    className,
    classNames,
    localization
}: OrganizationSettingsCardsProps) {
    const {
        hooks: { useActiveOrganization },
        organization,
        account: accountOptions,
        replace
    } = useContext(AuthUIContext)

    const {
        data: activeOrganization,
        isPending: organizationPending,
        isRefetching: organizationFetching
    } = useActiveOrganization()

    useEffect(() => {
        if (organizationPending || organizationFetching) return
        if (!activeOrganization)
            replace(
                `${accountOptions?.basePath}/${accountOptions?.viewPaths?.ORGANIZATIONS}`
            )
    }, [
        activeOrganization,
        organizationPending,
        organizationFetching,
        accountOptions?.basePath,
        accountOptions?.viewPaths?.ORGANIZATIONS,
        replace
    ])

    return (
        <div
            className={cn(
                "flex w-full flex-col gap-4 md:gap-6",
                className,
                classNames?.cards
            )}
        >
            {organization?.logo && (
                <OrganizationLogoCard
                    classNames={classNames?.card}
                    localization={localization}
                />
            )}

            <OrganizationNameCard
                classNames={classNames?.card}
                localization={localization}
            />

            <OrganizationSlugCard
                classNames={classNames?.card}
                localization={localization}
            />

            <DeleteOrganizationCard
                classNames={classNames?.card}
                localization={localization}
            />
        </div>
    )
}
