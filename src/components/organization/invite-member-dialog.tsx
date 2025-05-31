"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import type { AuthLocalization } from "../../lib/localization/auth-localization"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export interface InviteMemberDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
}

export function InviteMemberDialog({
    classNames,
    localization: localizationProp,
    onOpenChange,
    ...props
}: InviteMemberDialogProps) {
    const {
        authClient,
        hooks: { useActiveOrganization, useSession },
        localization: contextLocalization,
        toast,
        organization
    } = useContext(AuthUIContext)

    const localization = { ...contextLocalization, ...localizationProp }

    const { data: activeOrganization, refetch: refetchActiveOrganization } = useActiveOrganization()
    const { data: sessionData } = useSession()
    const membership = activeOrganization?.members.find((m) => m.userId === sessionData?.user.id)

    const builtInRoles = [
        { role: "owner", label: localization.owner },
        { role: "admin", label: localization.admin },
        { role: "member", label: localization.member }
    ] as const

    const roles = [...builtInRoles, ...(organization?.customRoles || [])]
    const availableRoles = roles.filter(
        (role) => membership?.role === "owner" || role.role !== "owner"
    )

    const formSchema = z.object({
        email: z.string().min(1, { message: localization.emailRequired }).email({
            message: localization.emailInvalid
        }),
        role: z.string().min(1, {
            message: `${localization.role} ${localization.isRequired}`
        })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: "member"
        }
    })

    const isSubmitting = form.formState.isSubmitting

    async function onSubmit({ email, role }: z.infer<typeof formSchema>) {
        try {
            await authClient.organization.inviteMember({
                email,
                role: role as (typeof builtInRoles)[number]["role"],
                organizationId: activeOrganization?.id,
                fetchOptions: { throw: true }
            })

            await refetchActiveOrganization?.()

            onOpenChange?.(false)
            form.reset()

            toast({
                variant: "success",
                message: localization.invitationSent || "Invitation sent successfully"
            })
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent className={classNames?.dialog?.content}>
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.inviteMember}
                    </DialogTitle>

                    <DialogDescription
                        className={cn("text-xs md:text-sm", classNames?.description)}
                    >
                        {localization.inviteMemberDescription}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={classNames?.label}>
                                        {localization.email}
                                    </FormLabel>

                                    <FormControl>
                                        <Input
                                            placeholder={localization.emailPlaceholder}
                                            type="email"
                                            {...field}
                                            className={classNames?.input}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={classNames?.label}>
                                        {localization.role}
                                    </FormLabel>

                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem key={role.role} value={role.role}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

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

                                {localization.sendInvitation}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
