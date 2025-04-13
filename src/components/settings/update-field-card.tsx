"use client"

import { type ReactNode, useContext, useState } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { FieldType } from "../../types/additional-fields"
import { CardContent } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"
import { SettingsCard, type SettingsCardClassNames } from "./settings-card"

export function UpdateFieldCard({
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
    label,
    type,
    validate
}: {
    className?: string
    classNames?: SettingsCardClassNames
    defaultValue?: unknown
    description?: ReactNode
    instructions?: ReactNode
    isPending?: boolean
    localization?: Partial<AuthLocalization>
    field: string
    placeholder?: string
    required?: boolean
    label?: ReactNode
    type?: FieldType
    validate?: (value: string) => boolean | Promise<boolean>
}) {
    const {
        hooks: { useSession },
        mutators: { updateUser },
        localization: authLocalization,
        optimistic
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { isPending: sessionPending } = useSession()
    const [disabled, setDisabled] = useState(true)

    const updateField = async (formData: FormData) => {
        const value = (formData.get(field) as string) || ""

        if (value === defaultValue) return {}

        if (validate && !validate(value)) {
            return {
                error: { message: `${localization.failedToValidate} ${field}` }
            }
        }

        setDisabled(true)

        try {
            await updateUser({
                [field]:
                    type === "number"
                        ? Number.parseFloat(value)
                        : type === "boolean"
                          ? value === "on"
                          : value
            })
        } catch (error) {
            setDisabled(false)
            throw error
        }
    }

    return (
        <SettingsCard
            className={className}
            classNames={classNames}
            description={description}
            formAction={updateField}
            instructions={instructions}
            isPending={isPending || sessionPending}
            title={label}
            actionLabel={localization.save}
            disabled={disabled}
            localization={localization}
            optimistic={optimistic}
        >
            <CardContent className={classNames?.content}>
                {type === "boolean" ? (
                    <div className={cn("flex items-center gap-3")}>
                        <Checkbox
                            defaultChecked={
                                typeof defaultValue === "boolean" ? defaultValue : false
                            }
                            id={field}
                            name={field}
                            onCheckedChange={() => setDisabled(false)}
                        />
                        <label htmlFor={field} className={classNames?.label}>
                            {label}
                        </label>
                    </div>
                ) : isPending ? (
                    <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
                ) : (
                    <Input
                        key={`${defaultValue}`}
                        className={classNames?.input}
                        defaultValue={defaultValue as string}
                        name={field}
                        placeholder={placeholder || (typeof label === "string" ? label : "")}
                        required={required}
                        type={type === "number" ? "number" : "text"}
                        onChange={(e) => setDisabled(e.target.value === defaultValue)}
                    />
                )}
            </CardContent>
        </SettingsCard>
    )
}
