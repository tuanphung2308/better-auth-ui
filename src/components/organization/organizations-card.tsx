"use client"

import type { Organization } from "better-auth/plugins/organization"
import { useContext, useState } from "react"

import { useIsHydrated } from "../../hooks/use-hydrated"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { SettingsCard } from "../settings/shared/settings-card"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { CardContent } from "../ui/card"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationCell } from "./organization-cell"

export interface OrganizationsCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    organizations?: Organization[] | null
    isPending?: boolean
    localization?: Partial<AuthLocalization>
    skipHook?: boolean
    refetch?: () => Promise<void>
}

export function OrganizationsCard({ className, classNames, localization }: OrganizationsCardProps) {
    const {
        hooks: { useListOrganizations },
        localization: contextLocalization
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const isHydrated = useIsHydrated()
    const { data: organizations, isPending: organizationsPending } = useListOrganizations()

    const isPending = !isHydrated || organizationsPending

    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    return (
        <>
            <SettingsCard
                className={className}
                classNames={classNames}
                title={localization.organizations}
                description={localization.organizationsDescription}
                instructions={localization.organizationsInstructions}
                actionLabel={localization.createOrganization}
                action={() => setCreateDialogOpen(true)}
                isPending={isPending}
            >
                {organizations?.length && (
                    <CardContent className={cn("grid gap-4", classNames?.content)}>
                        {organizations?.map((organization) => (
                            <OrganizationCell
                                key={organization.id}
                                classNames={classNames}
                                organization={organization}
                                localization={localization}
                            />
                        ))}
                    </CardContent>
                )}
            </SettingsCard>

            <CreateOrganizationDialog
                classNames={classNames}
                localization={localization}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </>
    )
}
