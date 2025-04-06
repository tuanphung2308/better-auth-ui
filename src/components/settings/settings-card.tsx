"use client"

import { Loader2 } from "lucide-react"
import { type ReactNode, useActionState, useContext, useState } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { FetchError } from "../../types/fetch-error"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import type { UserAvatarClassNames } from "../user-avatar"

import type { FieldType } from "../../types/additional-fields"
import { SettingsCardSkeleton } from "./skeletons/settings-card-skeleton"

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

export function SettingsCard({
    className,
    classNames,
    defaultValue,
    description,
    instructions,
    isPending,
    localization,
    field,
    placeholder,
    required,
    saveLabel,
    label,
    type = "string",
    formAction
}: {
    className?: string
    classNames?: SettingsCardClassNames
    defaultValue?: unknown | null
    description?: ReactNode
    instructions?: ReactNode
    isPending?: boolean
    localization?: Record<string, string>
    field: string
    placeholder?: string
    required?: boolean
    saveLabel?: ReactNode
    label?: ReactNode
    type?: FieldType
    formAction: (formData: FormData) => Promise<unknown> | Promise<void>
}) {
    let { optimistic } = useContext(AuthUIContext)
    const { localization: authLocalization, toast } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    if (field === "email" || field === "username") {
        optimistic = false
    }

    const [disabled, setDisabled] = useState(true)

    const performAction = async (_: Record<string, string>, formData: FormData) => {
        const formDataObject = Object.fromEntries(formData.entries())

        try {
            await formAction(formData)
            setDisabled(true)
        } catch (error) {
            toast({
                variant: "error",
                message: (error as Error).message || (error as FetchError).statusText
            })
            setDisabled(false)
        }

        return formDataObject as Record<string, string>
    }

    const [state, action, isSubmitting] = useActionState(performAction, {})

    if (isPending) {
        return <SettingsCardSkeleton className={className} classNames={classNames} />
    }

    return (
        <Card className={cn("w-full pb-0", className, classNames?.base)}>
            <form action={action}>
                {type === "boolean" ? (
                    <CardHeader className={classNames?.header}>
                        <div className={cn("flex items-center gap-3")}>
                            <Checkbox
                                defaultChecked={state[field] === "on" || !!defaultValue}
                                id={field}
                                name={field}
                                onCheckedChange={() => setDisabled(false)}
                            />

                            <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                                {label}
                            </CardTitle>
                        </div>

                        <CardDescription
                            className={cn("text-xs md:text-sm", classNames?.description)}
                        >
                            {description}
                        </CardDescription>
                    </CardHeader>
                ) : (
                    <>
                        <CardHeader className={classNames?.header}>
                            <CardTitle className={cn("text-lg", classNames?.title)}>
                                {label}
                            </CardTitle>

                            <CardDescription
                                className={cn("text-xs md:text-sm", classNames?.description)}
                            >
                                {description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className={cn("py-6", classNames?.content)}>
                            <Input
                                key={`${defaultValue}`}
                                className={classNames?.input}
                                defaultValue={state[field] ?? defaultValue}
                                name={field}
                                placeholder={
                                    placeholder || (typeof label === "string" ? label : "")
                                }
                                required={required}
                                type={type === "number" ? "number" : "text"}
                                onChange={() => setDisabled(false)}
                            />
                        </CardContent>
                    </>
                )}

                <CardFooter
                    className={cn(
                        "flex flex-col justify-between gap-4 rounded-b-xl border-t bg-muted pb-6 md:flex-row dark:bg-transparent",
                        classNames?.footer
                    )}
                >
                    {instructions && (
                        <CardDescription
                            className={cn("text-xs md:text-sm", classNames?.instructions)}
                        >
                            {instructions}
                        </CardDescription>
                    )}

                    <Button
                        className={cn("md:ms-auto", classNames?.button)}
                        disabled={isSubmitting || disabled}
                        size="sm"
                    >
                        <span className={cn(!optimistic && isSubmitting && "opacity-0")}>
                            {saveLabel || localization.save}
                        </span>

                        {!optimistic && isSubmitting && (
                            <span className="absolute">
                                <Loader2 className="animate-spin" />
                            </span>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
