"use client"
import { useContext } from "react"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { SettingsCardsProps } from "../settings/settings-cards"
import { OrganizationLogoCard } from "./organization-logo-card"
import { OrganizationNameCard } from "./organization-name-card"
import { OrganizationSlugCard } from "./organization-slug-card"

export function OrganizationSettingsCards({
    className,
    classNames,
    localization
}: Omit<SettingsCardsProps, "view">) {
    const { organization } = useContext(AuthUIContext)

    return (
        <div className={cn("flex w-full flex-col gap-4 md:gap-6", className, classNames?.cards)}>
            {organization?.logo && (
                <OrganizationLogoCard classNames={classNames?.card} localization={localization} />
            )}

            <OrganizationNameCard classNames={classNames?.card} localization={localization} />

            <OrganizationSlugCard classNames={classNames?.card} localization={localization} />
        </div>
    )
}
