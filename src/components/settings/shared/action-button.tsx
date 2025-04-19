"use client"

import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { useFormState } from "react-hook-form"

import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import type { SettingsCardClassNames } from "./settings-card"

interface ActionButtonProps {
    classNames?: SettingsCardClassNames
    action?: () => Promise<unknown> | unknown
    actionLabel: ReactNode
    disabled?: boolean
    isSubmitting?: boolean
    variant?: "default" | "destructive"
}

export function ActionButton({
    classNames,
    action,
    actionLabel,
    disabled,
    isSubmitting,
    variant = "default"
}: ActionButtonProps) {
    if (!action) {
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
            type="submit"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={action}
        >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {actionLabel}
        </Button>
    )
}
