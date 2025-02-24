"use client"

import { useState } from "react"

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
    localization,
    name
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    defaultValue?: string,
    localization?: Record<string, string>,
    name: string
}) {
    localization = { ...settingsLocalization, ...localization }

    const [disabled, setDisabled] = useState(true)

    return (
        <Card className={cn("w-full max-w-md overflow-hidden", className, classNames?.base)}>
            <form>
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
                        defaultValue={defaultValue}
                        name={name}
                        placeholder={localization[name + "Placeholder"]}
                        onChange={() => setDisabled(false)}
                    />
                </CardContent>

                <CardFooter className={cn("border-t bg-muted/40 py-4 md:py-3 flex flex-col md:flex-row gap-4 justify-between", classNames?.footer)}>
                    <CardDescription className={cn("text-xs md:text-sm", classNames?.instructions)}>
                        {localization[name + "Instructions"]}
                    </CardDescription>

                    <Button className={classNames?.saveButton} disabled={disabled} size="sm">
                        {localization.save}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}