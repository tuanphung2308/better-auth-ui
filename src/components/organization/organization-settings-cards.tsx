"use client"
import { cn } from "../../lib/utils"
import type { SettingsCardsProps } from "../settings/settings-cards"
import { OrganizationNameCard } from "./organization-name-card"

export function OrganizationSettingsCards({
    className,
    classNames,
    localization
}: Omit<SettingsCardsProps, "view">) {
    return (
        <div className={cn("flex w-full flex-col gap-4 md:gap-6", className, classNames?.cards)}>
            <OrganizationNameCard classNames={classNames?.card} localization={localization} />
        </div>
    )
}
