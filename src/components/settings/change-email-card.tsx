"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useContext, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import { CardContent } from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Skeleton } from "../ui/skeleton"
import { NewSettingsCard, type SettingsCardClassNames } from "./shared/new-settings-card"

export interface ChangeEmailCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    localization?: AuthLocalization
}

export function ChangeEmailCard({
    className,
    classNames,
    isPending,
    localization
}: ChangeEmailCardProps) {
    const {
        authClient,
        emailVerification,
        hooks: { useSession },
        localization: authLocalization,
        toast
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { data: sessionData, isPending: sessionPending, refetch } = useSession()
    const [resendDisabled, setResendDisabled] = useState(false)

    const formSchema = z.object({
        email: z.string().email({ message: localization.emailInstructions })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        values: { email: sessionData?.user.email || "" }
    })

    const { isSubmitting } = form.formState
    const resendForm = useForm()

    const changeEmail = async ({ email }: z.infer<typeof formSchema>) => {
        try {
            await authClient.changeEmail({
                newEmail: email,
                callbackURL: window.location.pathname,
                fetchOptions: { throw: true }
            })

            if (sessionData?.user.emailVerified) {
                toast({ variant: "success", message: localization.emailVerifyChange! })
            } else {
                toast({ variant: "success", message: localization.emailUpdated! })
                refetch?.()
            }
        } catch (error) {
            toast({ variant: "error", message: getLocalizedError({ error, localization }) })
        }
    }

    const resendVerification = async () => {
        if (!sessionData) return
        const email = sessionData.user.email

        setResendDisabled(true)

        try {
            await authClient.sendVerificationEmail({
                email,
                fetchOptions: { throw: true }
            })

            toast({ variant: "success", message: localization.emailVerification! })
        } catch (error) {
            toast({ variant: "error", message: getLocalizedError({ error, localization }) })
            setResendDisabled(false)
            throw error
        }
    }

    return (
        <>
            <Form {...form}>
                <form noValidate onSubmit={form.handleSubmit(changeEmail)}>
                    <NewSettingsCard
                        className={className}
                        classNames={classNames}
                        description={localization.emailDescription}
                        instructions={localization.emailInstructions}
                        isPending={isPending || sessionPending}
                        title={localization.email}
                        actionLabel={localization.save}
                    >
                        <CardContent className={classNames?.content}>
                            {isPending || sessionPending ? (
                                <Skeleton className={cn("h-9 w-full", classNames?.skeleton)} />
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    className={classNames?.input}
                                                    placeholder={localization.emailPlaceholder}
                                                    type="email"
                                                    disabled={isSubmitting}
                                                    {...field}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </CardContent>
                    </NewSettingsCard>
                </form>
            </Form>

            {emailVerification && sessionData?.user && !sessionData?.user.emailVerified && (
                <Form {...resendForm}>
                    <form onSubmit={resendForm.handleSubmit(resendVerification)}>
                        <NewSettingsCard
                            className={className}
                            classNames={classNames}
                            title={localization.verifyYourEmail}
                            description={localization.verifyYourEmailDescription}
                            actionLabel={localization.resendVerificationEmail}
                            disabled={resendDisabled}
                        />
                    </form>
                </Form>
            )}
        </>
    )
}
