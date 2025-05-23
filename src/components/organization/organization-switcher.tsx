"use client"

import { ChevronsUpDown, PlusCircleIcon, SettingsIcon } from "lucide-react"
import {
    type ComponentProps,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getLocalizedError } from "../../lib/utils"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { UserAvatar, type UserAvatarClassNames } from "../user-avatar"
import type { UserViewClassNames } from "../user-view"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationLogo } from "./organization-logo"
import { OrganizationView, type OrganizationViewClassNames } from "./organization-view"
import { PersonalAccountView } from "./personal-account-view"

export interface OrganizationSwitcherClassNames {
    base?: string
    skeleton?: string
    trigger?: {
        base?: string
        avatar?: UserAvatarClassNames
        user?: UserViewClassNames
        organization?: OrganizationViewClassNames
        skeleton?: string
    }
    content?: {
        base?: string
        user?: UserViewClassNames
        organization?: OrganizationViewClassNames
        avatar?: UserAvatarClassNames
        menuItem?: string
        separator?: string
    }
}

export interface OrganizationSwitcherProps {
    className?: string
    classNames?: OrganizationSwitcherClassNames
    align?: "center" | "start" | "end"
    customTrigger?: ReactNode
    localization?: AuthLocalization
}

/**
 * Displays an interactive user button with dropdown menu functionality
 *
 * Renders a user interface element that can be displayed as either an icon or full button:
 * - Shows a user avatar or placeholder when in icon mode
 * - Displays user name and email with dropdown indicator in full mode
 * - Provides dropdown menu with authentication options (sign in/out, settings, etc.)
 * - Supports multi-session functionality for switching between accounts
 * - Can be customized with additional links and styling options
 */
export function OrganizationSwitcher({
    className,
    classNames,
    align,
    customTrigger,
    localization: localizationProp,
    size,
    ...props
}: OrganizationSwitcherProps & ComponentProps<typeof Button>) {
    const {
        authClient,
        hooks: { useSession, useListOrganizations },
        localization: contextLocalization,
        toast
    } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...localizationProp }),
        [contextLocalization, localizationProp]
    )

    const { data: sessionData, isPending: sessionPending } = useSession()
    const user = sessionData?.user
    const [activeOrganizationPending, setActiveOrganizationPending] = useState(false)
    const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false)

    const { data: organizations, refetch: refetchOrganizations } = useListOrganizations()
    const { data: activeOrganization, isPending: organizationPending } =
        authClient.useActiveOrganization()

    // biome-ignore lint/correctness/useExhaustiveDependencies:
    useEffect(() => {
        setActiveOrganizationPending(false)
    }, [activeOrganization])

    const isPending = sessionPending || activeOrganizationPending || organizationPending

    const switchOrganization = useCallback(
        async (organizationId: string | null) => {
            setActiveOrganizationPending(true)

            try {
                await authClient.organization.setActive({
                    organizationId: organizationId,
                    fetchOptions: {
                        throw: true
                    }
                })
            } catch (error) {
                toast({
                    variant: "error",
                    message: getLocalizedError({ error, localization })
                })

                setActiveOrganizationPending(false)
            }
        },
        [authClient, toast, localization]
    )

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    asChild
                    className={cn(size === "icon" && "rounded-full", classNames?.trigger?.base)}
                >
                    {customTrigger ||
                        (size === "icon" ? (
                            <Button size="icon" className="size-fit" variant="ghost">
                                {activeOrganization ? (
                                    <OrganizationLogo
                                        key={activeOrganization?.logo}
                                        className={cn(className, classNames?.base)}
                                        classNames={classNames?.trigger?.avatar}
                                        isPending={isPending}
                                        organization={activeOrganization}
                                        aria-label={localization.organization}
                                    />
                                ) : (
                                    <UserAvatar
                                        key={user?.image}
                                        className={cn(className, classNames?.base)}
                                        classNames={classNames?.trigger?.avatar}
                                        isPending={isPending}
                                        user={user}
                                        aria-label={localization.account}
                                    />
                                )}
                            </Button>
                        ) : (
                            <Button
                                className={cn("!p-2 h-fit", className, classNames?.trigger?.base)}
                                size={size}
                                {...props}
                            >
                                {activeOrganization ? (
                                    <OrganizationView
                                        classNames={classNames?.trigger?.organization}
                                        isPending={isPending}
                                        localization={localization}
                                        organization={activeOrganization}
                                        size={size}
                                    />
                                ) : (
                                    <PersonalAccountView
                                        classNames={classNames?.trigger?.user}
                                        isPending={isPending}
                                        localization={localization}
                                        size={size}
                                        user={!user?.isAnonymous ? user : null}
                                    />
                                )}

                                <ChevronsUpDown className="ml-auto" />
                            </Button>
                        ))}
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className={cn(
                        "w-[--radix-dropdown-menu-trigger-width] min-w-56 max-w-64",
                        classNames?.content?.base
                    )}
                    align={align}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <div
                        className={cn("flex items-center gap-2 p-2", classNames?.content?.menuItem)}
                    >
                        {(user && !user.isAnonymous) || isPending ? (
                            <>
                                {activeOrganization ? (
                                    <OrganizationView
                                        classNames={classNames?.content?.organization}
                                        isPending={isPending}
                                        organization={activeOrganization}
                                        localization={localization}
                                    />
                                ) : (
                                    <PersonalAccountView
                                        classNames={classNames?.content?.user}
                                        isPending={isPending}
                                        localization={localization}
                                        user={user}
                                    />
                                )}

                                <Button size="icon" variant="outline" className="!size-8 ml-auto">
                                    <SettingsIcon className="size-4" />
                                </Button>
                            </>
                        ) : (
                            <div className="-my-1 text-muted-foreground text-xs">
                                {localization.organization}
                            </div>
                        )}
                    </div>

                    <DropdownMenuSeparator className={classNames?.content?.separator} />

                    {activeOrganization && (
                        <DropdownMenuItem
                            onClick={() => {
                                switchOrganization(null)
                            }}
                        >
                            <PersonalAccountView
                                classNames={classNames?.content?.user}
                                isPending={isPending}
                                localization={localization}
                                user={user}
                            />
                        </DropdownMenuItem>
                    )}

                    {organizations?.map(
                        (organization) =>
                            organization.id !== activeOrganization?.id && (
                                <DropdownMenuItem
                                    key={organization.id}
                                    onClick={() => {
                                        switchOrganization(organization.id)
                                    }}
                                >
                                    <OrganizationView
                                        classNames={classNames?.content?.organization}
                                        isPending={isPending}
                                        organization={organization}
                                        localization={localization}
                                    />
                                </DropdownMenuItem>
                            )
                    )}

                    {organizations?.length && (
                        <DropdownMenuSeparator className={classNames?.content?.separator} />
                    )}

                    <DropdownMenuItem
                        className={cn(
                            "flex cursor-pointer items-center gap-2",
                            classNames?.content?.menuItem
                        )}
                        onClick={() => setIsCreateOrgDialogOpen(true)}
                    >
                        <PlusCircleIcon className="h-4 w-4" />
                        {localization.createOrganization}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateOrganizationDialog
                open={isCreateOrgDialogOpen}
                onOpenChange={setIsCreateOrgDialogOpen}
                localization={localization}
                onSuccess={() => refetchOrganizations?.()}
            />
        </>
    )
}
