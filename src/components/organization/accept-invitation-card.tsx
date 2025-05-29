"use client"

import type { Invitation } from "better-auth/plugins/organization"
import { CheckIcon, Loader2, XIcon } from "lucide-react"
import { useContext, useEffect, useMemo, useRef, useState } from "react"

import { useAuthenticate } from "../../hooks/use-authenticate"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError, getSearchParam } from "../../lib/utils"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { OrganizationView } from "./organization-view"

interface InvitationWithOrganization extends Invitation {
    organizationName: string
    organizationSlug: string
    organizationLogo: string
}

export interface AcceptInvitationCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: Partial<AuthLocalization>
}

export function AcceptInvitationCard({
    className,
    classNames,
    localization: localizationProp
}: AcceptInvitationCardProps) {
    const {
        authClient,
        localization: contextLocalization,
        toast,
        redirectTo,
        replace,
        organization
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const { data: sessionData } = useAuthenticate()

    const [isRejecting, setIsRejecting] = useState(false)
    const [isAccepting, setIsAccepting] = useState(false)
    const isProcessing = isRejecting || isAccepting
    const [invitationId, setInvitationId] = useState<string | null>(getSearchParam("invitationId"))
    const [invitation, setInvitation] = useState<InvitationWithOrganization>()
    const invitationFetched = useRef(false)

    useEffect(() => {
        const invitationIdParam = getSearchParam("invitationId")

        if (!invitationIdParam) {
            toast({
                variant: "error",
                message: localization.invalidInvitation
            })

            replace(redirectTo)

            return
        }

        setInvitationId(invitationIdParam)
    }, [localization.invalidInvitation, toast, replace, redirectTo])

    useEffect(() => {
        if (!sessionData || !invitationId || invitationFetched.current) return
        invitationFetched.current = true

        const fetchInvitation = async () => {
            try {
                const invitation = await authClient.organization.getInvitation({
                    query: {
                        id: invitationId
                    },
                    fetchOptions: { throw: true }
                })

                if (
                    invitation.status !== "pending" ||
                    new Date(invitation.expiresAt) < new Date()
                ) {
                    toast({
                        variant: "error",
                        message:
                            new Date(invitation.expiresAt) < new Date()
                                ? localization.invitationExpired
                                : localization.invalidInvitation
                    })

                    replace(redirectTo)
                    return
                }

                setInvitation(invitation as unknown as InvitationWithOrganization)
            } catch (error) {
                toast({
                    variant: "error",
                    message: getLocalizedError({ error, localization })
                })

                replace(redirectTo)
            }
        }

        fetchInvitation()
    }, [invitationId, sessionData, authClient, localization, toast, replace, redirectTo])

    const acceptInvitation = async () => {
        if (!invitationId) return

        setIsAccepting(true)

        try {
            await authClient.organization.acceptInvitation({
                invitationId: invitationId,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.invitationAccepted || "Invitation accepted"
            })

            replace(redirectTo)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
            setIsAccepting(false)
        }
    }

    const rejectInvitation = async () => {
        if (!invitationId) return

        setIsRejecting(true)

        try {
            await authClient.organization.rejectInvitation({
                invitationId: invitationId,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.invitationRejected
            })

            replace(redirectTo)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })

            setIsRejecting(false)
        }
    }

    const builtInRoles = [
        { role: "owner", label: localization.owner },
        { role: "admin", label: localization.admin },
        { role: "member", label: localization.member }
    ]

    const roles = [...builtInRoles, ...(organization?.customRoles || [])]
    const roleLabel = roles.find((r) => r.role === invitation?.role)?.label || invitation?.role

    const isPending = !invitation

    return (
        <Card className={cn("w-full max-w-sm", className, classNames?.base)}>
            <CardHeader className={cn("justify-items-center text-center", classNames?.header)}>
                {isPending ? (
                    <>
                        <Skeleton
                            className={cn(
                                "my-1 h-5 w-full max-w-32 md:h-5.5 md:w-40",
                                classNames?.skeleton
                            )}
                        />

                        <Skeleton
                            className={cn(
                                "my-0.5 h-3 w-full max-w-56 md:h-3.5 md:w-6",
                                classNames?.skeleton
                            )}
                        />
                    </>
                ) : (
                    <>
                        <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                            {localization.acceptInvitation}
                        </CardTitle>

                        <CardDescription
                            className={cn("text-xs md:text-sm", classNames?.description)}
                        >
                            {localization.acceptInvitationDescription}
                        </CardDescription>
                    </>
                )}
            </CardHeader>

            <CardContent className={cn("flex flex-col gap-6 truncate", classNames?.content)}>
                <Card className={cn("flex-row items-center p-4")}>
                    <OrganizationView
                        isPending={isPending}
                        organization={
                            invitation
                                ? {
                                      id: invitation.organizationId,
                                      name: invitation.organizationName,
                                      slug: invitation.organizationSlug,
                                      logo: invitation.organizationLogo,
                                      createdAt: new Date()
                                  }
                                : null
                        }
                        localization={localization}
                    />

                    {isPending ? (
                        <Skeleton className="mt-0.5 ml-auto h-4 w-full max-w-14 shrink-2" />
                    ) : (
                        <p className="ml-auto text-muted-foreground text-sm">{roleLabel}</p>
                    )}
                </Card>

                <div className="grid grid-cols-2 gap-3">
                    {isPending ? (
                        <Skeleton className="h-9 w-full" />
                    ) : (
                        <Button
                            variant="outline"
                            className={cn(classNames?.button, classNames?.outlineButton)}
                            onClick={rejectInvitation}
                            disabled={isProcessing}
                        >
                            {isRejecting ? <Loader2 className="animate-spin" /> : <XIcon />}

                            {localization.reject}
                        </Button>
                    )}

                    {isPending ? (
                        <Skeleton className="h-9 w-full" />
                    ) : (
                        <Button
                            className={cn(classNames?.button, classNames?.primaryButton)}
                            onClick={acceptInvitation}
                            disabled={isProcessing}
                        >
                            {isAccepting ? <Loader2 className="animate-spin" /> : <CheckIcon />}

                            {localization.accept}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
