"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { Organization } from "better-auth/plugins/organization"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import {
    SettingsCard,
    type SettingsCardProps
} from "../settings/shared/settings-card"
import { CardContent } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"

export interface OrganizationNameCardProps extends SettingsCardProps {
    slug?: string
}

export function OrganizationNameCard({
    className,
    classNames,
    localization: localizationProp,
    slug: slugProp,
    ...props
}: OrganizationNameCardProps) {
    const {
        hooks: { useActiveOrganization, useListOrganizations },
        localization: contextLocalization,
        organization: organizationOptions
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const { slugPaths, slug: contextSlug } = organizationOptions || {}
    const slug = slugProp || contextSlug

    let activeOrganization: Organization | null | undefined

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
            <SettingsCard
                className={className}
                classNames={classNames}
                description={localization.ORGANIZATION_NAME_DESCRIPTION}
                instructions={localization.ORGANIZATION_NAME_INSTRUCTIONS}
                isPending
                title={localization.ORGANIZATION_NAME}
                actionLabel={localization.SAVE}
                optimistic={props.optimistic}
                {...props}
            >
                <CardContent className={classNames?.content}>
                    <Skeleton
                        className={cn("h-9 w-full", classNames?.skeleton)}
                    />
                </CardContent>
            </SettingsCard>
        )
    }

    return (
        <OrganizationNameForm
            className={className}
            classNames={classNames}
            localization={localization}
            slug={slug}
            {...props}
        />
    )
}

function OrganizationNameForm({
    className,
    classNames,
    localization: localizationProp,
    slug: slugProp,
    ...props
}: OrganizationNameCardProps) {
    const {
        authClient,
        localization: contextLocalization,
        hooks: {
            useActiveOrganization,
            useListOrganizations,
            useHasPermission
        },
        optimistic,
        organization: organizationOptions,
        toast
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const { slugPaths, slug: contextSlug } = organizationOptions || {}
    const slug = slugProp || contextSlug

    const { data: organizations, refetch: refetchOrganizations } =
        useListOrganizations()

    let activeOrganization: { id: string; name?: string } | null | undefined

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
            }
        })

    const isPending = !activeOrganization || permissionPending

    const formSchema = z.object({
        name: z.string().min(1, {
            message: `${localization.ORGANIZATION_NAME} ${localization.IS_REQUIRED}`
        })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: { name: activeOrganization?.name || "" }
    })

    const { isSubmitting } = form.formState

    const updateOrganizationName = async ({
        name
    }: z.infer<typeof formSchema>) => {
        if (!activeOrganization) return

        if (activeOrganization.name === name) {
            toast({
                variant: "error",
                message: `${localization.ORGANIZATION_NAME} ${localization.IS_THE_SAME}`
            })

            return
        }

        try {
            await authClient.organization.update({
                organizationId: activeOrganization.id,
                data: { name },
                fetchOptions: {
                    throw: true
                }
            })

            await refetchOrganizations?.()

            toast({
                variant: "success",
                message: `${localization.ORGANIZATION_NAME} ${localization.UPDATED_SUCCESSFULLY}`
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
                    description={localization.ORGANIZATION_NAME_DESCRIPTION}
                    instructions={localization.ORGANIZATION_NAME_INSTRUCTIONS}
                    isPending={isPending}
                    title={localization.ORGANIZATION_NAME}
                    actionLabel={localization.SAVE}
                    optimistic={optimistic}
                    disabled={!hasPermission?.success}
                    {...props}
                >
                    <CardContent className={classNames?.content}>
                        {isPending ? (
                            <Skeleton
                                className={cn(
                                    "h-9 w-full",
                                    classNames?.skeleton
                                )}
                            />
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
                                                    localization.ORGANIZATION_NAME_PLACEHOLDER
                                                }
                                                disabled={
                                                    isSubmitting ||
                                                    !hasPermission?.success
                                                }
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage
                                            className={classNames?.error}
                                        />
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
