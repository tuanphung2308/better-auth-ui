import type { ComponentProps } from "react"
import { useContext } from "react"

import type { Organization } from "better-auth/plugins/organization"
import { Building2Icon } from "lucide-react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Skeleton } from "../ui/skeleton"

export interface OrganizationLogoClassNames {
    base?: string
    image?: string
    fallback?: string
    fallbackIcon?: string
    skeleton?: string
}

export interface OrganizationLogoProps {
    classNames?: OrganizationLogoClassNames
    isPending?: boolean
    size?: "sm" | "default" | "lg" | "xl" | null
    organization?: Organization | null
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: Partial<AuthLocalization>
}

/**
 * Displays an organization logo with image and fallback support
 *
 * Renders an organization's logo image when available, with appropriate fallbacks:
 * - Shows a skeleton when isPending is true
 * - Falls back to a building icon when no logo is available
 */
export function OrganizationLogo({
    className,
    classNames,
    isPending,
    size,
    organization,
    localization: propLocalization,
    ...props
}: OrganizationLogoProps & ComponentProps<typeof Avatar>) {
    const { localization: contextLocalization } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...propLocalization }

    const name = organization?.name
    const src = organization?.logo

    if (isPending) {
        return (
            <Skeleton
                className={cn(
                    "shrink-0 rounded-full",
                    size === "sm"
                        ? "size-6"
                        : size === "lg"
                          ? "size-10"
                          : size === "xl"
                            ? "size-12"
                            : "size-8",
                    className,
                    classNames?.base,
                    classNames?.skeleton
                )}
            />
        )
    }

    return (
        <Avatar
            className={cn(
                "bg-muted",
                size === "sm"
                    ? "size-6"
                    : size === "lg"
                      ? "size-10"
                      : size === "xl"
                        ? "size-12"
                        : "size-8",
                className,
                classNames?.base
            )}
            {...props}
        >
            <AvatarImage
                alt={name || localization?.organization}
                className={classNames?.image}
                src={src || undefined}
            />

            <AvatarFallback
                className={cn("text-foreground", classNames?.fallback)}
                delayMs={src ? 600 : undefined}
            >
                <Building2Icon className={cn("size-[50%]", classNames?.fallbackIcon)} />
            </AvatarFallback>
        </Avatar>
    )
}
