"use client"

import { Loader2 } from "lucide-react"
import { useActionState, useState } from "react"
import { toast } from "sonner"

import { cn } from "../../lib/utils"
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

export type SettingsCardClassNames = {
    base?: string
    content?: string
    description?: string
    footer?: string
    header?: string
    instructions?: string
    saveButton?: string
    title?: string
}

export function SettingsCard({
    className,
    classNames,
    defaultValue,
    formAction,
    localization,
    name
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    defaultValue?: string,
    formAction: (formData: FormData) => Promise<{ error?: { code?: string, message?: string, status?: number, statusText?: string } | null }>,
    localization?: Record<string, string>,
    name: string
}) {
    localization = { ...settingsLocalization, ...localization }

    const [disabled, setDisabled] = useState(true)

    const performAction = async (_: Record<string, string>, formData: FormData) => {
        const formDataObject = Object.fromEntries(formData.entries())

        setDisabled(true)
        const { error } = await formAction(formData)
        if (error) {
            toast.error(error.message || error.statusText)
            setDisabled(false)
        }

        return formDataObject as Record<string, string>
    }

    const [state, action, isSubmitting] = useActionState(performAction, {})

    return (
        <Card className={cn("w-full max-w-md overflow-hidden", className, classNames?.base)}>
            <form action={action}>
                <CardHeader className={classNames?.header}>
                    <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization[name]}
                    </CardTitle>

                    <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                        {localization[name + "Description"]}
                    </CardDescription>
                </CardHeader>

                <CardContent className={classNames?.content}>
                    <Input
                        defaultValue={state[name] ?? defaultValue}
                        name={name}
                        placeholder={localization[name + "Placeholder"]}
                        onChange={() => setDisabled(false)}
                    />
                </CardContent>

                <CardFooter className={cn("border-t bg-muted/20 py-4 md:py-3 flex flex-col md:flex-row gap-4 justify-between", classNames?.footer)}>
                    <CardDescription className={cn("text-xs md:text-sm", classNames?.instructions)}>
                        {localization[name + "Instructions"]}
                    </CardDescription>

                    <Button className={classNames?.saveButton} disabled={isSubmitting || disabled} size="sm">
                        <span className={cn(isSubmitting && "opacity-0")}>
                            {localization.save}
                        </span>

                        {isSubmitting && (
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