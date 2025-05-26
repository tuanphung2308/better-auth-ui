"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import { SettingsCard, type SettingsCardProps } from "../settings/shared/settings-card"
import { CardContent } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"

export function OrganizationSlugCard({
    className,
    classNames,
    localization: localizationProp,
    ...props
}: SettingsCardProps) {
    const {
        authClient,
        hooks: { useListOrganizations },
        localization: contextLocalization,
        optimistic,
        toast
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const { data: activeOrganization, refetch: refetchActiveOrganization } =
        authClient.useActiveOrganization()
    const { refetch: refetchOrganizations } = useListOrganizations()

    const isPending = !activeOrganization

    const formSchema = z.object({
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
        values: { slug: activeOrganization?.slug || "" }
    })

    const { isSubmitting } = form.formState

    const updateOrganizationSlug = async ({ slug }: z.infer<typeof formSchema>) => {
        if (!activeOrganization) {
            toast({
                variant: "error",
                message: localization.error
            })
            return
        }

        if (activeOrganization.slug === slug) {
            toast({
                variant: "error",
                message: `${localization.slugUrl} ${localization.isTheSame}`
            })

            return
        }

        try {
            await authClient.organization.update({
                data: { slug },
                fetchOptions: {
                    throw: true
                }
            })

            await refetchActiveOrganization?.()
            await refetchOrganizations?.()

            toast({
                variant: "success",
                message: `${localization.slugUrl} ${localization.updatedSuccessfully}`
            })
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(updateOrganizationSlug)}>
                <SettingsCard
                    className={className}
                    classNames={classNames}
                    description={localization.slugUrlDescription}
                    instructions={localization.slugUrlInstructions}
                    isPending={isPending}
                    title={localization.slugUrl}
                    actionLabel={localization.save}
                    optimistic={optimistic}
                    {...props}
                >
                    <CardContent className={classNames?.content}>
                        {isPending ? (
                            <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
                        ) : (
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                className={classNames?.input}
                                                placeholder={
                                                    localization.organizationSlugPlaceholder
                                                }
                                                disabled={isSubmitting}
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage className={classNames?.error} />
                                    </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </SettingsCard>
            </form>
        </Form>
    )
}
