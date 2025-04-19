"use client"

import type { ReactNode } from "react"

import { cn } from "../../../lib/utils"
import { CardDescription, CardFooter } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import { ActionButton } from "./action-button"
import type { SettingsCardClassNames } from "./settings-card"

export interface SettingsCardFooterProps {
    className?: string
    classNames?: SettingsCardClassNames
    action?: () => Promise<unknown> | unknown
    actionLabel?: ReactNode
    disabled?: boolean
    instructions?: ReactNode
    isPending?: boolean
    isSubmitting?: boolean
    optimistic?: boolean
    variant?: "default" | "destructive"
}

export function SettingsCardFooter({
    action,
    className,
    classNames,
    actionLabel,
    disabled,
    instructions,
    isPending,
    isSubmitting,
    variant
}: SettingsCardFooterProps) {
    return (
        <CardFooter
            className={cn(
                "flex flex-col justify-between gap-4 rounded-b-xl md:flex-row",
                (actionLabel || instructions) && "!py-4 border-t",
                variant === "destructive"
                    ? "border-destructive/30 bg-destructive/10"
                    : "bg-muted dark:bg-transparent",
                className,
                classNames?.footer
            )}
        >
            {isPending ? (
                <>
                    {instructions && (
                        <Skeleton
                            className={cn(
                                "my-0.5 h-3 w-48 max-w-full md:h-4 md:w-56",
                                classNames?.skeleton
                            )}
                        />
                    )}

                    {actionLabel && (
                        <Skeleton className={cn("h-8 w-14 md:ms-auto", classNames?.skeleton)} />
                    )}
                </>
            ) : (
                <>
                    {instructions && (
                        <CardDescription
                            className={cn(
                                "text-muted-foreground text-xs md:text-sm",
                                classNames?.instructions
                            )}
                        >
                            {instructions}
                        </CardDescription>
                    )}

                    {actionLabel && (
                        <ActionButton
                            classNames={classNames}
                            actionLabel={actionLabel}
                            onClick={action}
                            disabled={disabled}
                            isSubmitting={isSubmitting}
                            variant={variant}
                        />
                    )}
                </>
            )}
        </CardFooter>
    )
}
