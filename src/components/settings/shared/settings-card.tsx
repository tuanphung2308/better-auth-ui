"use client"

import type { ReactNode } from "react"

import { cn } from "../../../lib/utils"
import { Card } from "../../ui/card"
import type { UserAvatarClassNames } from "../../user-avatar"
import { SettingsCardFooter } from "./settings-card-footer"
import { SettingsCardHeader } from "./settings-card-header"

export type SettingsCardClassNames = {
    base?: string
    avatar?: UserAvatarClassNames
    button?: string
    cell?: string
    destructiveButton?: string
    content?: string
    description?: string
    dialog?: {
        content?: string
        footer?: string
        header?: string
    }
    footer?: string
    header?: string
    input?: string
    instructions?: string
    label?: string
    primaryButton?: string
    secondaryButton?: string
    skeleton?: string
    title?: string
}

export interface SettingsCardProps {
    children?: ReactNode
    className?: string
    classNames?: SettingsCardClassNames
    title: ReactNode
    description?: ReactNode
    instructions?: ReactNode
    action?: () => Promise<unknown> | unknown
    actionLabel?: ReactNode
    isSubmitting?: boolean
    disabled?: boolean
    isPending?: boolean
    optimistic?: boolean
    variant?: "default" | "destructive"
}

export function SettingsCard({
    children,
    className,
    classNames,
    title,
    description,
    instructions,
    action,
    actionLabel,
    disabled,
    isPending,
    isSubmitting,
    optimistic,
    variant
}: SettingsCardProps) {
    return (
        <Card
            className={cn(
                "w-full pb-0 text-start",
                variant === "destructive" && "border-destructive/40",
                className,
                classNames?.base
            )}
        >
            <SettingsCardHeader
                title={title}
                description={description}
                isPending={isPending}
                classNames={classNames}
            />

            {children}

            <SettingsCardFooter
                action={action}
                actionLabel={actionLabel}
                disabled={disabled}
                isPending={isPending}
                isSubmitting={isSubmitting}
                instructions={instructions}
                classNames={classNames}
                optimistic={optimistic}
                variant={variant}
            />
        </Card>
    )
}
