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
    classNames?: {
        title?: string
        description?: string
        dialog?: {
            content?: string
            header?: string
            footer?: string
        }
        button?: string
        primaryButton?: string
        outlineButton?: string
    }
    localization?: AuthLocalization
    onSuccess?: () => void
    refetch?: () => void
}

export function CreateOrganizationDialog({
    className,
    classNames,
    localization: localizationProp,
    onSuccess,
    refetch,
    onOpenChange,
    ...props
}: CreateOrganizationDialogProps) {
    const {
        authClient,
        localization: contextLocalization,
        toast,
        organization
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [logo, setLogo] = useState<string | null>(null)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const formSchema = z.object({
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
            }),
        logo: z.string().optional()
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            logo: ""
        }
    })

    const isSubmitting = form.formState.isSubmitting

    const handleLogoChange = async (file: File) => {
        setUploadingLogo(true)

        const logoExtension = organization?.logoExtension || "png"
        const logoSize = organization?.logoSize || 256

        try {
            const resizedFile = await resizeAndCropImage(
                file,
                crypto.randomUUID(),
                logoSize,
                logoExtension
            )

            let image: string | undefined | null

            if (organization?.uploadLogo) {
                image = await organization.uploadLogo(resizedFile)
            } else {
                image = await fileToBase64(resizedFile)
            }

            if (image) {
                setLogo(image)
                form.setValue("logo", image)
            } else {
                setLogo(null)
                form.setValue("logo", "")
            }
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setUploadingLogo(false)
    }

    const handleDeleteLogo = () => {
        setLogo(null)
        form.setValue("logo", "")
    }

    const openFileDialog = () => fileInputRef.current?.click()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await authClient.organization.create({
                name: values.name,
                slug: values.slug,
                logo: values.logo,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.organizationCreated
            })

            onSuccess?.()
            refetch?.()
            onOpenChange?.(false)
            form.reset()
            setLogo(null)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent
                className={classNames?.dialog?.content}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                        <FormField
                            control={form.control}
                            name="logo"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{localization.logo}</FormLabel>
                                    <div className="flex items-center gap-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="!size-fit rounded-full"
                                                    size="icon"
                                                >
                                                    <OrganizationLogo
                                                        isPending={uploadingLogo}
                                                        className="size-16"
                                                        organization={
                                                            logo
                                                                ? {
                                                                      id: "",
                                                                      name:
                                                                          form.watch("name") || "",
                                                                      slug: "",
                                                                      createdAt: new Date(),
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
                                                        onClick={handleDeleteLogo}
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
                                            type="button"
                                            variant="outline"
                                            onClick={openFileDialog}
                                            disabled={uploadingLogo}
                                        >
                                            {uploadingLogo && <Loader2 className="animate-spin" />}

                                            {localization.upload}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{localization.organizationName}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={localization.organizationNamePlaceholder}
                                            autoComplete="off"
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
                                            autoComplete="off"
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
                                disabled={isSubmitting}
                            >
                                {localization.cancel}
                            </Button>

                            <Button
                                type="submit"
                                variant="default"
                                className={cn(classNames?.button, classNames?.primaryButton)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {localization.createOrganization}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
