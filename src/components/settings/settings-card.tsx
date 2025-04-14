"use client"

import { type ReactNode, useActionState, useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getErrorMessage } from "../../lib/get-error-message"
import { cn } from "../../lib/utils"
import { Card } from "../ui/card"
import type { UserAvatarClassNames } from "../user-avatar"
import { SettingsCardFooter } from "./settings-card-footer"
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

export interface SettingsCardProps {
    children?: ReactNode
    title: ReactNode
    description?: ReactNode
    instructions?: ReactNode
    actionLabel?: ReactNode
    isSubmitting?: boolean
    disabled?: boolean
    isPending?: boolean
    className?: string
    classNames?: SettingsCardClassNames
    formAction?: (formData: FormData) => Promise<unknown> | Promise<void> | void
    localization?: AuthLocalization
    optimistic?: boolean
    /**
     * The variant of the card
     * @default "default"
     */
    variant?: "default" | "destructive"
}

export function SettingsCard({
    children,
    title,
    description,
    instructions,
    actionLabel,
    isSubmitting: externalIsSubmitting,
    disabled,
    isPending,
    className,
    classNames,
    formAction,
    localization,
    optimistic,
    variant = "default"
}: SettingsCardProps) {
    const { localization: authLocalization, toast } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const performAction = async (_: Record<string, unknown>, formData: FormData) => {
        try {
            await formAction?.(formData)
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        }

        return {}
    }

    const [_, internalAction, isSubmitting] = useActionState(performAction, {})

    return (
        <form action={internalAction}>
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
                    actionLabel={actionLabel}
                    disabled={disabled}
                    isSubmitting={isSubmitting || externalIsSubmitting}
                    isPending={isPending}
                    instructions={instructions}
                    classNames={classNames}
                    optimistic={optimistic}
                    variant={variant}
                />
            </Card>
        </form>
    )
}
