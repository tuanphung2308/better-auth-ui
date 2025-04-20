"use client"

import type { BetterFetchError } from "@better-fetch/fetch"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useOnSuccessTransition } from "../../../hooks/use-success-transition"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthClient } from "../../../types/auth-client"
import { Button } from "../../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import type { AuthFormClassNames } from "../auth-form"

export interface RecoverAccountFormProps {
    className?: string
    classNames?: AuthFormClassNames
    isSubmitting?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
    setIsSubmitting?: (value: boolean) => void
}

export function RecoverAccountForm({
    className,
    classNames,
    isSubmitting,
    localization,
    redirectTo,
    setIsSubmitting
}: RecoverAccountFormProps) {
    const { authClient, basePath, viewPaths, replace, toast } = useContext(AuthUIContext)

    const { onSuccess, isPending: transitionPending } = useOnSuccessTransition({ redirectTo })

    const formSchema = z.object({
        code: z.string().min(1, { message: localization.backupCodeRequired })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: ""
        }
    })

    isSubmitting = isSubmitting || form.formState.isSubmitting || transitionPending

    useEffect(() => {
        setIsSubmitting?.(form.formState.isSubmitting || transitionPending)
    }, [form.formState.isSubmitting, transitionPending, setIsSubmitting])

    async function verifyBackupCode({ code }: z.infer<typeof formSchema>) {
        try {
            await (authClient as AuthClient).twoFactor.verifyBackupCode({
                code,
                fetchOptions: { throw: true }
            })

            onSuccess()
        } catch (error) {
            toast({ variant: "error", message: getLocalizedError({ error, localization }) })

            if ((error as BetterFetchError).error.code === "INVALID_TWO_FACTOR_COOKIE") {
                replace(`${basePath}/${viewPaths.signIn}${window.location.search}`)
            }

            form.reset()
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(verifyBackupCode)}
                className={cn("grid gap-6", className, classNames?.base)}
            >
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={classNames?.label}>
                                {localization.backupCode}
                            </FormLabel>

                            <FormControl>
                                <Input
                                    placeholder={localization.backupCodePlaceholder}
                                    autoComplete="one-time-code"
                                    className={classNames?.input}
                                    disabled={isSubmitting}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(classNames?.button, classNames?.primaryButton)}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        localization.recoverAccountAction
                    )}
                </Button>
            </form>
        </Form>
    )
}
