"use client"

import { Trash2Icon, UploadCloudIcon } from "lucide-react"
import { type ComponentProps, useContext, useRef, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { fileToBase64, resizeAndCropImage } from "../../lib/image-utils"
import { cn, getLocalizedError } from "../../lib/utils"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { SettingsCardFooter } from "../settings/shared/settings-card-footer"
import { SettingsCardHeader } from "../settings/shared/settings-card-header"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { OrganizationLogo } from "./organization-logo"

export interface OrganizationLogoCardProps extends ComponentProps<typeof Card> {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

export function OrganizationLogoCard({
    className,
    classNames,
    localization,
    ...props
}: OrganizationLogoCardProps) {
    const {
        authClient,
        hooks: { useActiveOrganization, useListOrganizations },
        localization: authLocalization,
        optimistic,
        organization,
        toast
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { data: activeOrganization, refetch: refetchActiveOrganization } = useActiveOrganization()
    const { refetch: refetchOrganizations } = useListOrganizations()

    const isPending = !activeOrganization

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogoChange = async (file: File) => {
        if (!activeOrganization || !organization?.logo) return

        setLoading(true)
        const resizedFile = await resizeAndCropImage(
            file,
            crypto.randomUUID(),
            organization.logo.size,
            organization.logo.extension
        )

        let image: string | undefined | null

        if (organization.logo.upload) {
            image = await organization.logo.upload(resizedFile)
        } else {
            image = await fileToBase64(resizedFile)
        }

        if (!image) {
            setLoading(false)
            return
        }

        if (optimistic && !organization.logo.upload) setLoading(false)

        try {
            await authClient.organization.update({
                data: { logo: image },
                fetchOptions: { throw: true }
            })

            await refetchActiveOrganization?.()
            await refetchOrganizations?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setLoading(false)
    }

    const handleDeleteLogo = async () => {
        if (!activeOrganization) return

        setLoading(true)

        try {
            await authClient.organization.update({
                data: { logo: "" },
                fetchOptions: { throw: true }
            })

            await refetchActiveOrganization?.()
            await refetchOrganizations?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setLoading(false)
    }

    const openFileDialog = () => fileInputRef.current?.click()

    return (
        <Card className={cn("w-full pb-0 text-start", className, classNames?.base)} {...props}>
            <input
                ref={fileInputRef}
                accept="image/*"
                disabled={loading}
                hidden
                type="file"
                onChange={(e) => {
                    const file = e.target.files?.item(0)
                    if (file) handleLogoChange(file)

                    e.target.value = ""
                }}
            />

            <div className="flex justify-between">
                <SettingsCardHeader
                    className="grow self-start"
                    title={localization.logo}
                    description={localization.logoDescription}
                    isPending={isPending}
                    classNames={classNames}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            className="me-6 size-fit rounded-full"
                            size="icon"
                            variant="ghost"
                        >
                            <OrganizationLogo
                                isPending={isPending || loading}
                                key={activeOrganization?.logo}
                                className="size-20 text-2xl"
                                classNames={classNames?.avatar}
                                organization={activeOrganization}
                                localization={localization}
                            />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                        <DropdownMenuItem onClick={openFileDialog} disabled={loading}>
                            <UploadCloudIcon />
                            {localization.uploadLogo}
                        </DropdownMenuItem>
                        {activeOrganization?.logo && (
                            <DropdownMenuItem
                                onClick={handleDeleteLogo}
                                disabled={loading}
                                variant="destructive"
                            >
                                <Trash2Icon />
                                {localization.deleteLogo}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <SettingsCardFooter
                className="!py-5"
                instructions={localization.logoInstructions}
                classNames={classNames}
                isPending={isPending}
                isSubmitting={loading}
            />
        </Card>
    )
}
