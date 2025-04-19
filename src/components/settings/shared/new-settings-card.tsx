"use client"

import type { ReactNode } from "react"
import type { UseFormReturn } from "react-hook-form"
import type * as z from "zod"
import { cn } from "../../../lib/utils"
import { Card } from "../../ui/card"
import type { UserAvatarClassNames } from "../../user-avatar"
import { NewSettingsCardFooter } from "./new-settings-card-footer"
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

export interface SettingsCardProps<TFormSchema extends z.ZodTypeAny> {
    children?: ReactNode
    title: ReactNode
    description?: ReactNode
    instructions?: ReactNode
    action?: () => Promise<unknown> | unknown
    actionLabel?: ReactNode
    isSubmitting?: boolean
    disabled?: boolean
    render?: (form: UseFormReturn<z.infer<TFormSchema>>) => ReactNode
    isPending?: boolean
    className?: string
    classNames?: SettingsCardClassNames
    optimistic?: boolean
    variant?: "default" | "destructive"
}

export function NewSettingsCard<TFormSchema extends z.ZodTypeAny>({
    children,
    title,
    description,
    instructions,
    action,
    actionLabel,
    disabled,
    isPending,
    isSubmitting,
    className,
    classNames,
    optimistic,
    variant = "default"
}: SettingsCardProps<TFormSchema>) {
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

            <NewSettingsCardFooter
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
