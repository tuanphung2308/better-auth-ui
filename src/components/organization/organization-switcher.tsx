"use client"
import { ChevronsUpDown, PlusCircleIcon } from "lucide-react"
import {
    type ComponentProps,
    type ReactNode,
    useCallback,
    useContext,
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
import { UserView, type UserViewClassNames } from "../user-view"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationView } from "./organization-view"

export interface OrganizationSwitcherClassNames {
    base?: string
    skeleton?: string
    trigger?: {
        base?: string
        avatar?: UserAvatarClassNames
        user?: UserViewClassNames
        skeleton?: string
    }
    content?: {
        base?: string
        user?: UserViewClassNames
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
    const { data } = authClient.useActiveOrganization()
    const isPending = sessionPending || activeOrganizationPending

    const switchOrganization = useCallback(
        async (organizationId: string) => {
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
                                <UserAvatar
                                    key={user?.image}
                                    isPending={isPending}
                                    className={cn(className, classNames?.base)}
                                    classNames={classNames?.trigger?.avatar}
                                    user={user}
                                    aria-label={localization.account}
                                />
                            </Button>
                        ) : (
                            <Button
                                className={cn("!p-2 h-fit", className, classNames?.trigger?.base)}
                                size={size}
                                {...props}
                            >
                                <UserView
                                    size={size}
                                    user={!user?.isAnonymous ? user : null}
                                    isPending={isPending}
                                    classNames={classNames?.trigger?.user}
                                    localization={localization}
                                />

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
                    <div className={cn("p-2", classNames?.content?.menuItem)}>
                        {(user && !user.isAnonymous) || isPending ? (
                            <UserView
                                user={user}
                                isPending={isPending}
                                classNames={classNames?.content?.user}
                                localization={localization}
                            />
                        ) : (
                            <div className="-my-1 text-muted-foreground text-xs">
                                {localization.account}
                            </div>
                        )}
                    </div>

                    <DropdownMenuSeparator className={classNames?.content?.separator} />

                    {organizations?.map((organization) => (
                        <DropdownMenuItem
                            key={organization.id}
                            onClick={() => {
                                switchOrganization(organization.id)
                            }}
                        >
                            <OrganizationView
                                organization={organization}
                                size={size === "icon" ? "default" : size}
                                localization={localization}
                            />
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className={classNames?.content?.separator} />

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
