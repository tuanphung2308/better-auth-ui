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

export function OrganizationNameCard({
    className,
    classNames,
    localization: localizationProp,
    ...props
}: SettingsCardProps) {
    const {
        authClient,
        hooks: { useActiveOrganization, useListOrganizations, useHasPermission },
        localization: contextLocalization,
        optimistic,
        toast
    } = useContext(AuthUIContext)

    const { data: hasPermission, isPending: permissionPending } = useHasPermission({
        permissions: {
            organization: ["update"]
        }
    })

    const localization = { ...contextLocalization, ...localizationProp }

    const { data: activeOrganization, refetch: refetchActiveOrganization } = useActiveOrganization()

    const isPending = !activeOrganization || permissionPending

    const formSchema = z.object({
        name: z.string().min(1, {
            message: `${localization.organizationName} ${localization.isRequired}`
        })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: { name: activeOrganization?.name || "" }
    })

    const { isSubmitting } = form.formState

    const updateOrganizationName = async ({ name }: z.infer<typeof formSchema>) => {
        if (!activeOrganization) {
            toast({
                variant: "error",
                message: localization.error
            })

            return
        }

        if (activeOrganization.name === name) {
            toast({
                variant: "error",
                message: `${localization.organizationName} ${localization.isTheSame}`
            })

            return
        }

        try {
            await authClient.organization.update({
                data: { name },
                fetchOptions: {
                    throw: true
                }
            })

            await refetchActiveOrganization?.()

            toast({
                variant: "success",
                message: `${localization.organizationName} ${localization.updatedSuccessfully}`
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
            <form onSubmit={form.handleSubmit(updateOrganizationName)}>
                <SettingsCard
                    className={className}
                    classNames={classNames}
                    description={localization.organizationNameDescription}
                    instructions={localization.organizationNameInstructions}
                    isPending={isPending}
                    title={localization.organizationName}
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                className={classNames?.input}
                                                placeholder={
                                                    localization.organizationNamePlaceholder
                                                }
                                                disabled={isSubmitting || !hasPermission?.success}
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
