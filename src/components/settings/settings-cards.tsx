"use client"

import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"

import { ChangeEmailCard } from "./change-email-card"
import { ChangePasswordCard } from "./change-password-card"
import { DeleteAccountCard } from "./delete-account-card"
import { ProvidersCard } from "./providers-card"
import type { SettingsCardClassNames } from "./settings-card"
import { UpdateNameCard } from "./update-name-card"
import { UpdateUsernameCard } from "./update-username-card"

export const settingsLocalization = {
    changePassword: "Change Password",
    changePasswordDescription: "Enter your current password and a new password.",
    changePasswordInstructions: "Please use 8 characters at minimum.",
    changePasswordSuccess: "Your password has been changed.",
    currentPassword: "Current Password",
    currentPasswordPlaceholder: "Current Password",
    setPasswordDescription: "You registered using an OAuth provider. Click below to set a password for your account.",
    setPassword: "Set Password",
    setPasswordEmailSent: "Check your email to set your password.",
    deleteAccount: "Delete Account",
    deleteAccountDescription: "Permanently remove your account and all of its contents. This action is not reversible, so please continue with caution.",
    deleteAccountInstructions: "Please confirm the deletion of your account. This action is not reversible, so please continue with caution.",
    deleteAccountEmail: "Please check your email to verify the deletion of your account.",
    deleteAccountSuccess: "Your account has been deleted.",
    deleteAccountNotFresh: "You must be recently logged in to delete your account.",
    name: "Name",
    nameDescription: "Please enter your full name, or a display name.",
    nameInstructions: "Please use 32 characters at maximum.",
    namePlaceholder: "Name",
    email: "Email",
    emailDescription: "Enter the email address you want to use to log in.",
    emailInstructions: "Please use a valid email address.",
    emailPlaceholder: "m@example.com",
    emailVerifyChange: "Please check your email to verify the change.",
    emailVerification: "Please check your email for the verification link.",
    newPassword: "New Password",
    newPasswordPlaceholder: "New Password",
    password: "Password",
    passwordDescription: "Enter your current password.",
    passwordInstructions: "Please use 8 characters at minimum.",
    passwordPlaceholder: "Password",
    save: "Save",
    username: "Username",
    usernameDescription: "Enter the username you want to use to log in.",
    usernameInstructions: "Please use 32 characters at maximum.",
    usernamePlaceholder: "Username",
    providers: "Providers",
    providersDescription: "Connect your Account with a third-party service.",
    providerLink: "Link",
    providerLinkSuccess: "Provider linked successfully.",
    providerUnlink: "Unlink",
    providerUnlinkSuccess: "Provider unlinked successfully.",
    providersLoadingError: "Could not load account info",
    signOut: "Sign Out",
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
    const {
        authClient,
        credentials,
        deleteUser,
        hooks: { useSession, useListAccounts },
        username
    } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending } = useSession()
    const { accounts, isPending: accountsPending, refetch } = useListAccounts()

    const isPending = sessionPending || accountsPending

    return (
        <div className={cn("w-full flex flex-col gap-4 items-center", className)}>
            {username && (
                <UpdateUsernameCard
                    classNames={classNames}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            <UpdateNameCard
                classNames={classNames}
                isPending={isPending}
                localization={localization}
            />

            <ChangeEmailCard
                classNames={classNames}
                isPending={isPending}
                localization={localization}
            />

            {credentials && (
                <ChangePasswordCard
                    accounts={accounts}
                    className={className}
                    classNames={classNames}
                    isPending={isPending}
                    localization={localization}
                />
            )}

            <ProvidersCard
                accounts={accounts}
                classNames={classNames}
                isPending={isPending}
                localization={localization}
                refetch={refetch}
                unlinkAccount={(providerId: string) => authClient.unlinkAccount({ providerId })}
            />

            {deleteUser && (
                <DeleteAccountCard
                    accounts={accounts}
                    classNames={classNames}
                    isPending={isPending}
                    localization={localization}
                />
            )}
        </div>
    )
}