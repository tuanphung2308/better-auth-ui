"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Trash2Icon, UploadCloudIcon } from "lucide-react"
import { type ComponentProps, useContext, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { fileToBase64, resizeAndCropImage } from "../../lib/image-utils"
import { cn, getLocalizedError } from "../../lib/utils"
import type { SettingsCardClassNames } from "../settings/shared/settings-card"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { OrganizationLogo } from "./organization-logo"

export interface CreateOrganizationDialogProps extends ComponentProps<typeof Dialog> {
    className?: string
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

export function CreateOrganizationDialog({
    className,
    classNames,
    localization: localizationProp,
    onOpenChange,
    ...props
}: CreateOrganizationDialogProps) {
    const {
        authClient,
        hooks: { useListOrganizations },
        localization: contextLocalization,
        organization,
        toast
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const [logo, setLogo] = useState<string | null>(null)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const openFileDialog = () => fileInputRef.current?.click()

    const { refetch: refetchOrganizations } = useListOrganizations()

    const formSchema = z.object({
        logo: z.string().optional(),
        name: z.string().min(1, {
            message: `${localization.organizationName} ${localization.isRequired}`
        }),
        slug: z
            .string()
            .min(1, {
                message: `${localization.slugUrl} ${localization.isRequired}`
            })
            .regex(/^[a-z0-9-]+$/, {
                message: `${localization.slugUrl} ${localization.isInvalid}`
            })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            logo: "",
            name: "",
            slug: ""
        }
    })

    const isSubmitting = form.formState.isSubmitting

    const handleLogoChange = async (file: File) => {
        if (!organization?.logo) return

        setUploadingLogo(true)

        try {
            const resizedFile = await resizeAndCropImage(
                file,
                crypto.randomUUID(),
                organization.logo.size,
                organization.logo.extension
            )

            let image: string | undefined | null

            if (organization?.logo.upload) {
                image = await organization.logo.upload(resizedFile)
            } else {
                image = await fileToBase64(resizedFile)
            }

            setLogo(image || null)
            form.setValue("logo", image || "")
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setUploadingLogo(false)
    }

    const deleteLogo = () => {
        setLogo(null)
        form.setValue("logo", "")
    }

    async function onSubmit({ name, slug, logo }: z.infer<typeof formSchema>) {
        try {
            await authClient.organization.create({
                name,
                slug,
                logo,
                fetchOptions: { throw: true }
            })

            await refetchOrganizations?.()
            onOpenChange?.(false)
            form.reset()
            setLogo(null)

            toast({
                variant: "success",
                message: localization.organizationCreated
            })
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    if (!organization) {
        console.warn(
            "[Better Auth UI] The `organization` prop is not configured on AuthUIProvider. Please check the documentation for more information."
        )

        return null
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent className={classNames?.dialog?.content}>
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.createOrganization}
                    </DialogTitle>

                    <DialogDescription
                        className={cn("text-xs md:text-sm", classNames?.description)}
                    >
                        {localization.organizationDescription}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {organization.logo && (
                            <FormField
                                control={form.control}
                                name="logo"
                                render={() => (
                                    <FormItem>
                                        <input
                                            ref={fileInputRef}
                                            accept="image/*"
                                            disabled={uploadingLogo}
                                            hidden
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files?.item(0)
                                                if (file) handleLogoChange(file)
                                                e.target.value = ""
                                            }}
                                        />

                                        <FormLabel>{localization.logo}</FormLabel>

                                        <div className="flex items-center gap-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        className="size-fit rounded-full"
                                                        size="icon"
                                                        type="button"
                                                    >
                                                        <OrganizationLogo
                                                            className="size-16"
                                                            isPending={uploadingLogo}
                                                            localization={localization}
                                                            organization={
                                                                logo
                                                                    ? {
                                                                          name: form.watch("name"),
                                                                          logo
                                                                      }
                                                                    : null
                                                            }
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                    align="start"
                                                    onCloseAutoFocus={(e) => e.preventDefault()}
                                                >
                                                    <DropdownMenuItem
                                                        onClick={openFileDialog}
                                                        disabled={uploadingLogo}
                                                    >
                                                        <UploadCloudIcon />
                                                        {localization.uploadLogo}
                                                    </DropdownMenuItem>

                                                    {logo && (
                                                        <DropdownMenuItem
                                                            onClick={deleteLogo}
                                                            disabled={uploadingLogo}
                                                            variant="destructive"
                                                        >
                                                            <Trash2Icon />
                                                            {localization.deleteLogo}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <Button
                                                disabled={uploadingLogo}
                                                variant="outline"
                                                onClick={openFileDialog}
                                                type="button"
                                            >
                                                {uploadingLogo && (
                                                    <Loader2 className="animate-spin" />
                                                )}

                                                {localization.upload}
                                            </Button>
                                        </div>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{localization.organizationName}</FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder={localization.organizationNamePlaceholder}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{localization.slugUrl}</FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder={localization.organizationSlugPlaceholder}
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className={classNames?.dialog?.footer}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange?.(false)}
                                className={cn(classNames?.button, classNames?.outlineButton)}
                            >
                                {localization.cancel}
                            </Button>

                            <Button
                                type="submit"
                                className={cn(classNames?.button, classNames?.primaryButton)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="animate-spin" />}

                                {localization.createOrganization}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
