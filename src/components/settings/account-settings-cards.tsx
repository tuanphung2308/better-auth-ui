"use client"

import { useContext } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { AccountsCard } from "./account/accounts-card"
import { UpdateAvatarCard } from "./account/update-avatar-card"
import { UpdateFieldCard } from "./account/update-field-card"
import { UpdateNameCard } from "./account/update-name-card"
import { UpdateUsernameCard } from "./account/update-username-card"
import { ChangeEmailCard } from "./security/change-email-card"
import type { SettingsCardClassNames } from "./shared/settings-card"

export interface AccountSettingsCardsProps {
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

export function AccountSettingsCards({ classNames, localization }: AccountSettingsCardsProps) {
    const {
        additionalFields,
        avatar,
        changeEmail,
        credentials,
        hooks: { useSession },
        multiSession,
        nameRequired,
        settings
    } = useContext(AuthUIContext)

    const { data: sessionData } = useSession()

    return (
        <>
            {settings?.fields?.includes("image") && avatar && (
                <UpdateAvatarCard classNames={classNames} localization={localization} />
            )}

            {credentials?.username && (
                <UpdateUsernameCard classNames={classNames} localization={localization} />
            )}

            {(settings?.fields?.includes("name") || nameRequired) && (
                <UpdateNameCard classNames={classNames} localization={localization} />
            )}

            {changeEmail && <ChangeEmailCard classNames={classNames} localization={localization} />}

            {settings?.fields?.map((field) => {
                if (field === "image") return null
                if (field === "name") return null
                const additionalField = additionalFields?.[field]
                if (!additionalField) return null

                const { label, description, instructions, placeholder, required, type, validate } =
                    additionalField

                // @ts-ignore Custom fields are not typed
                const defaultValue = sessionData?.user[field] as unknown

                return (
                    <UpdateFieldCard
                        key={field}
                        classNames={classNames}
                        value={defaultValue}
                        description={description}
                        name={field}
                        instructions={instructions}
                        label={label}
                        localization={localization}
                        placeholder={placeholder}
                        required={required}
                        type={type}
                        validate={validate}
                    />
                )
            })}

            {multiSession && <AccountsCard classNames={classNames} localization={localization} />}
        </>
    )
}
