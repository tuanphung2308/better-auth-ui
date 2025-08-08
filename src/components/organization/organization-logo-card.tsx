"use client"

import type { Organization } from "better-auth/plugins/organization"
import { Trash2Icon, UploadCloudIcon } from "lucide-react"
import { type ComponentProps, useContext, useRef, useState } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { fileToBase64, resizeAndCropImage } from "../../lib/image-utils"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthLocalization } from "../../localization/auth-localization"
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
    slug?: string
}

export function OrganizationLogoCard({
    className,
    classNames,
    localization,
    slug: slugProp,
    ...props
}: OrganizationLogoCardProps) {
    const {
        hooks: { useActiveOrganization, useListOrganizations },
        localization: authLocalization,
        organization: organizationOptions
    } = useContext(AuthUIContext)

    if (!organizationOptions) {
        return null
    }

    const { slugPaths, slug: contextSlug } = organizationOptions

    localization = { ...authLocalization, ...localization }

    const slug = slugProp || contextSlug

    let activeOrganization: Organization | undefined | null

    if (slugPaths) {
        const { data: organizations } = useListOrganizations()
        activeOrganization = organizations?.find(
            (organization) => organization.slug === slug
        )
    } else {
        const { data } = useActiveOrganization()

        activeOrganization = data
    }

    if (!activeOrganization) {
        return (
            <Card
                className={cn(
                    "w-full pb-0 text-start",
                    className,
                    classNames?.base
                )}
                {...props}
            >
                <div className="flex justify-between">
                    <SettingsCardHeader
                        className="grow self-start"
                        title={localization.LOGO}
                        description={localization.LOGO_DESCRIPTION}
                        isPending={true}
                        classNames={classNames}
                    />

                    <Button
                        type="button"
                        className="me-6 size-fit rounded-full"
                        size="icon"
                        variant="ghost"
                        disabled
                    >
                        <OrganizationLogo
                            isPending={true}
                            className="size-20 text-2xl"
                            classNames={classNames?.avatar}
                            localization={localization}
                        />
                    </Button>
                </div>

                <SettingsCardFooter
                    className="!py-5"
                    instructions={localization.LOGO_INSTRUCTIONS}
                    classNames={classNames}
                    isPending={true}
                    isSubmitting={false}
                />
            </Card>
        )
    }

    return (
        <OrganizationLogoForm
            className={className}
            classNames={classNames}
            localization={localization}
            {...props}
        />
    )
}

function OrganizationLogoForm({
    className,
    classNames,
    localization,
    slug: slugProp,
    ...props
}: OrganizationLogoCardProps) {
    const {
        authClient,
        hooks: {
            useActiveOrganization,
            useListOrganizations,
            useHasPermission
        },
        localization: authLocalization,
        optimistic,
        organization: organizationOptions,
        toast
    } = useContext(AuthUIContext)

    if (!organizationOptions?.logo) {
        return null
    }

    const { slugPaths, slug: contextSlug } = organizationOptions

    const slug = slugProp || contextSlug
    localization = { ...authLocalization, ...localization }

    const { data: organizations, refetch: refetchOrganizations } =
        useListOrganizations()

    let activeOrganization: Organization | undefined | null

    if (slugPaths) {
        activeOrganization = organizations?.find(
            (organization) => organization.slug === slug
        )
    } else {
        const { data } = useActiveOrganization()
        activeOrganization = data
    }

    const { data: hasPermission, isPending: permissionPending } =
        useHasPermission({
            permissions: {
                organization: ["update"]
            },
            organizationId: activeOrganization?.id
        })

    const isPending = !activeOrganization || permissionPending

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogoChange = async (file: File) => {
        if (
            !activeOrganization ||
            !organizationOptions?.logo ||
            !hasPermission?.success
        )
            return

        setLoading(true)
        const resizedFile = await resizeAndCropImage(
            file,
            crypto.randomUUID(),
            organizationOptions.logo.size,
            organizationOptions.logo.extension
        )

        let image: string | undefined | null

        if (organizationOptions.logo.upload) {
            image = await organizationOptions.logo.upload(resizedFile)
        } else {
            image = await fileToBase64(resizedFile)
        }

        if (!image) {
            setLoading(false)
            return
        }

        if (optimistic && !organizationOptions.logo.upload) setLoading(false)

        try {
            await authClient.organization.update({
                organizationId: activeOrganization.id,
                data: { logo: image },
                fetchOptions: { throw: true }
            })

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
        if (!activeOrganization || !hasPermission?.success) return

        setLoading(true)

        try {
            if (activeOrganization.logo && organizationOptions.logo?.delete) {
                await organizationOptions?.logo.delete(activeOrganization.logo)
            }

            await authClient.organization.update({
                organizationId: activeOrganization.id,
                data: { logo: "" },
                fetchOptions: { throw: true }
            })

            await refetchOrganizations?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setLoading(false)
    }

    const openFileDialog = () => {
        if (hasPermission?.success) {
            fileInputRef.current?.click()
        }
    }

    return (
        <Card
            className={cn(
                "w-full pb-0 text-start",
                className,
                classNames?.base
            )}
            {...props}
        >
            <input
                ref={fileInputRef}
                accept="image/*"
                disabled={loading || !hasPermission?.success}
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
                    title={localization.LOGO}
                    description={localization.LOGO_DESCRIPTION}
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
                            disabled={!hasPermission?.success}
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

                    <DropdownMenuContent
                        align="end"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                        <DropdownMenuItem
                            onClick={openFileDialog}
                            disabled={loading || !hasPermission?.success}
                        >
                            <UploadCloudIcon />
                            {localization.UPLOAD_LOGO}
                        </DropdownMenuItem>
                        {activeOrganization?.logo && (
                            <DropdownMenuItem
                                onClick={handleDeleteLogo}
                                disabled={loading || !hasPermission?.success}
                                variant="destructive"
                            >
                                <Trash2Icon />
                                {localization.DELETE_LOGO}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <SettingsCardFooter
                className="!py-5"
                instructions={localization.LOGO_INSTRUCTIONS}
                classNames={classNames}
                isPending={isPending}
                isSubmitting={loading}
            />
        </Card>
    )
}
