"use client"

import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"

import { SettingsCard, type SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"

export function UpdateFieldCard({
    className,
    classNames,
    defaultValue,
    description,
    instructions,
    localization,
    name,
    placeholder,
    title,
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    defaultValue?: string,
    description?: string,
    instructions?: string,
    localization?: Partial<typeof settingsLocalization>,
    name: string
    placeholder?: string,
    title?: string,
}) {
    localization = { ...settingsLocalization, ...localization }

    const { authClient } = useContext(AuthUIContext)

    const formAction = async (formData: FormData) => {
        const value = formData.get(name) as string || ""

        if (value == defaultValue) return {}

        const { error } = await authClient.updateUser({
            [name]: value
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
            localization={localization}
            name={name}
            placeholder={placeholder}
            title={title}
        />
    )
}