"use client"

import { useContext } from "react"

import { AuthUIContext, type FieldType } from "../../lib/auth-ui-provider"

import { SettingsCard, type SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"

export function UpdateFieldCard({
    className,
    classNames,
    defaultValue,
    description,
    instructions,
    isPending,
    localization,
    name,
    placeholder,
    required,
    title,
    type
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    defaultValue?: string,
    description?: string,
    instructions?: string,
    isPending?: boolean,
    localization?: Partial<typeof settingsLocalization>,
    name: string
    placeholder?: string,
    required?: boolean,
    title?: string,
    type?: FieldType
}) {
    localization = { ...settingsLocalization, ...localization }

    const { hooks: { useSession } } = useContext(AuthUIContext)
    const { isPending: sessionPending, updateUser } = useSession()

    const formAction = async (formData: FormData) => {
        const value = formData.get(name) as string || ""

        if (value == defaultValue) return {}

        const { error } = await updateUser({
            [name]: type == "number" ? parseFloat(value) : value
        })

        return { error }
    }

    return (
        <SettingsCard
            key={defaultValue}
            className={className}
            classNames={classNames}
            defaultValue={defaultValue}
            description={description}
            formAction={formAction}
            instructions={instructions}
            isPending={isPending || sessionPending}
            localization={localization}
            name={name}
            placeholder={placeholder}
            required={required}
            title={title}
            type={type}
        />
    )
}