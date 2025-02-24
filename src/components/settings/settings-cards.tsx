import { cn } from "../../lib/utils"

import { ChangeEmailCard } from "./change-email-card"
import type { SettingsCardClassNames } from "./settings-card"
import { UpdateNameCard } from "./update-name-card"

export const settingsLocalization = {
    name: "Name",
    nameDescription: "Please enter your full name, or a display name.",
    nameInstructions: "Please use 32 characters at maximum.",
    namePlaceholder: "Name",
    email: "Email",
    emailDescription: "Enter the email address you want to use to log in.",
    emailInstructions: "Please use a valid email address.",
    emailPlaceholder: "m@example.com",
    save: "Save"
}

export function SettingsCards({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    localization?: Partial<typeof settingsLocalization>
}) {
    return (
        <div className={cn("w-full flex flex-col gap-4 items-center", className)}>
            <UpdateNameCard
                classNames={classNames}
                localization={localization}
            />

            <ChangeEmailCard
                classNames={classNames}
                localization={localization}
            />
        </div>
    )
}