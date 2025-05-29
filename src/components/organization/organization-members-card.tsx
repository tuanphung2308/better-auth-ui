"use client"

import { useContext, useEffect, useState } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { SettingsCard } from "../settings/shared/settings-card"
import type { SettingsCardProps } from "../settings/shared/settings-card"
import { CardContent } from "../ui/card"
import { InviteMemberDialog } from "./invite-member-dialog"
import { MemberCell } from "./member-cell"

export function OrganizationMembersCard({
    className,
    classNames,
    localization: localizationProp,
    ...props
}: SettingsCardProps) {
    const {
        authClient,
        basePath,
        hooks: { useActiveOrganization },
        localization: contextLocalization,
        replace,
        viewPaths
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const { data: activeOrganization, isPending: organizationPending } = useActiveOrganization()

    useEffect(() => {
        if (organizationPending) return
        if (!activeOrganization) replace(`${basePath}/${viewPaths.settings}`)
    }, [activeOrganization, organizationPending, basePath, replace, viewPaths.settings])

    const members = activeOrganization?.members

    const isPending = !activeOrganization

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

    return (
        <>
            <SettingsCard
                className={className}
                classNames={classNames}
                title={localization.members}
                description={localization.membersDescription}
                instructions={localization.membersInstructions}
                actionLabel={localization.inviteMember}
                action={() => setInviteDialogOpen(true)}
                isPending={isPending}
                {...props}
            >
                {members && members.length > 0 && (
                    <CardContent className={cn("grid gap-4", classNames?.content)}>
                        {members.map((member) => (
                            <MemberCell
                                key={member.id}
                                classNames={classNames}
                                member={member}
                                localization={localization}
                            />
                        ))}
                    </CardContent>
                )}
            </SettingsCard>

            <InviteMemberDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                classNames={classNames}
                localization={localization}
            />
        </>
    )
}
