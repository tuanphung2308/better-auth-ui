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
    content?: string
    description?: string
    footer?: string
    header?: string
    input?: string
    instructions?: string
    label?: string
    skeleton?: string
    title?: string
}

export interface SettingsCardProps<TFormSchema extends z.ZodTypeAny> {
    children?: ReactNode
    title: ReactNode
    description?: ReactNode
    instructions?: ReactNode
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
    actionLabel,
    disabled,
    isPending,
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
                actionLabel={actionLabel}
                disabled={disabled}
                isPending={isPending}
                instructions={instructions}
                classNames={classNames}
                optimistic={optimistic}
                variant={variant}
            />
        </Card>
    )
}
