"use client"

import type { Organization } from "better-auth/plugins/organization"
import { useContext, useMemo } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"
import { OrganizationLogo, type OrganizationLogoClassNames } from "./organization-logo"

export interface OrganizationViewClassNames {
    base?: string
    avatar?: OrganizationLogoClassNames
    content?: string
    title?: string
    subtitle?: string
    skeleton?: string
}

export interface OrganizationViewProps {
    className?: string
    classNames?: OrganizationViewClassNames
    isPending?: boolean
    size?: "sm" | "default" | "lg" | null
    organization?: Organization | null
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
}

/**
 * Displays user information with avatar and details in a compact view
 *
 * Renders a user's profile information with appropriate fallbacks:
 * - Shows avatar alongside user name and email when available
 * - Shows loading skeletons when isPending is true
 * - Falls back to generic "User" text when neither name nor email is available
 * - Supports customization through classNames prop
 */
export function OrganizationView({
    className,
    classNames,
    isPending,
    size,
    organization,
    localization: propLocalization
}: OrganizationViewProps) {
    const { localization: contextLocalization } = useContext(AuthUIContext)

    const localization = useMemo(
        () => ({ ...contextLocalization, ...propLocalization }),
        [contextLocalization, propLocalization]
    )

    return (
        <div className={cn("flex items-center gap-2", className, classNames?.base)}>
            <OrganizationLogo
                className={cn(size !== "sm" && "my-0.5")}
                classNames={classNames?.avatar}
                isPending={isPending}
                size={size}
                organization={organization}
                localization={localization}
            />

            <div className={cn("grid flex-1 text-left leading-tight", classNames?.content)}>
                {isPending ? (
                    <>
                        <Skeleton
                            className={cn(
                                "max-w-full",
                                size === "lg" ? "h-4.5 w-32" : "h-3.5 w-24",
                                classNames?.title,
                                classNames?.skeleton
                            )}
                        />
                        {size !== "sm" && (
                            <Skeleton
                                className={cn(
                                    "mt-1.5 max-w-full",
                                    size === "lg" ? "h-3.5 w-40" : "h-3 w-32",
                                    classNames?.subtitle,
                                    classNames?.skeleton
                                )}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <span
                            className={cn(
                                "truncate font-semibold",
                                size === "lg" ? "text-base" : "text-sm",
                                classNames?.title
                            )}
                        >
                            {organization?.name}
                        </span>

                        {size !== "sm" && (
                            <span
                                className={cn(
                                    "truncate opacity-70",
                                    size === "lg" ? "text-sm" : "text-xs",
                                    classNames?.subtitle
                                )}
                            >
                                {organization?.slug}
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
