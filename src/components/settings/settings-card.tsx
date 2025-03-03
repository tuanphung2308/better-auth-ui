"use client"

import { Loader2 } from "lucide-react"
import { useActionState, useContext, useState } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { FetchError } from "../../types/fetch-error"
import { Button } from "../ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../ui/card"
import { Input } from "../ui/input"

import { settingsLocalization } from "./settings-cards"
import { SettingsCardSkeleton } from "./skeletons/settings-card-skeleton"

export type SettingsCardClassNames = {
    base?: string
    button?: string
    content?: string
    description?: string
    footer?: string
    header?: string
    input?: string
    instructions?: string
    label?: string
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
    name,
    placeholder,
    saveLabel,
    title,
    formAction,
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    defaultValue?: string | null,
    description?: string,
    instructions?: string,
    isPending?: boolean,
    localization?: Record<string, string>,
    name: string
    placeholder?: string,
    saveLabel?: string,
    title?: string,
    formAction: (formData: FormData) => Promise<{ error?: FetchError | null }>,
}) {
    localization = { ...settingsLocalization, ...localization }

    let { optimistic } = useContext(AuthUIContext)

    if (name == "email" || name == "username") {
        optimistic = false
    }

    const [disabled, setDisabled] = useState(true)

    const performAction = async (_: Record<string, string>, formData: FormData) => {
        const formDataObject = Object.fromEntries(formData.entries())

        setDisabled(true)
        formAction(formData).then(({ error }) => {
            if (error) {
                toast.error(error.message || error.statusText)
                setDisabled(false)
            }
        })

        return formDataObject as Record<string, string>
    }

    const [state, action, isSubmitting] = useActionState(performAction, {})

    if (isPending) {
        return <SettingsCardSkeleton className={className} classNames={classNames} />
    }

    return (
        <Card className={cn("w-full max-w-lg overflow-hidden", className, classNames?.base)}>
            <form action={action}>
                <CardHeader className={classNames?.header}>
                    <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {title}
                    </CardTitle>

                    <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardContent className={classNames?.content}>
                    <Input
                        className={classNames?.input}
                        defaultValue={state[name] ?? defaultValue}
                        name={name}
                        placeholder={placeholder}
                        onChange={() => setDisabled(false)}
                    />
                </CardContent>

                <CardFooter
                    className={cn(
                        "border-t bg-muted dark:bg-transparent py-4 md:py-3 flex flex-col md:flex-row gap-4 justify-between",
                        classNames?.footer
                    )}
                >
                    {instructions && (
                        <CardDescription className={cn("text-xs md:text-sm", classNames?.instructions)}>
                            {instructions}
                        </CardDescription>
                    )}

                    <Button
                        className={cn("md:ms-auto", classNames?.button)}
                        disabled={(!optimistic && isSubmitting) || disabled}
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