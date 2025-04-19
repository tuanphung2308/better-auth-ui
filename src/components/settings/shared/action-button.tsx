"use client"

import { Loader2 } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { useFormState } from "react-hook-form"

import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import type { SettingsCardClassNames } from "./settings-card"

interface ActionButtonProps extends ComponentProps<typeof Button> {
    classNames?: SettingsCardClassNames
    actionLabel: ReactNode
    disabled?: boolean
    isSubmitting?: boolean
}

export function ActionButton({
    classNames,
    actionLabel,
    disabled,
    isSubmitting,
    variant,
    onClick,
    ...props
}: ActionButtonProps) {
    if (!onClick) {
        const formState = useFormState()
        isSubmitting = formState.isSubmitting
    }

    return (
        <Button
            className={cn(
                "md:ms-auto",
                classNames?.button,
                variant === "default" && classNames?.primaryButton,
                variant === "destructive" && classNames?.destructiveButton
            )}
            disabled={isSubmitting || disabled}
            size="sm"
            type={onClick ? "button" : "submit"}
            variant={variant}
            onClick={onClick}
            {...props}
        >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {actionLabel}
        </Button>
    )
}
