"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"

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
    const { authClient, localization: contextLocalization, toast } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Define form schema with localized error messages
    const formSchema = z.object({
        name: z.string().min(1, {
            message: `${localization.organizationName} ${localization.isRequired}`
        }),
        slug: z
            .string()
            .min(1, {
                message: `${localization.organizationSlug} ${localization.isRequired}`
            })
            .regex(/^[a-z0-9-]+$/, {
                message: `${localization.organizationSlug} ${localization.isInvalid}`
            })
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: ""
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true)

            await authClient.organization.create({
                name: values.name,
                slug: values.slug,
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
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className={classNames?.dialog?.content}
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
                                    <FormLabel>{localization.organizationSlug}</FormLabel>
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
                                {localization.create}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
