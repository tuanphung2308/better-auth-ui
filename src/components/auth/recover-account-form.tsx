"use client"

import type { BetterFetchError } from "@better-fetch/fetch"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import type { AuthFormClassNames } from "./auth-form"

export interface RecoverAccountFormProps {
    className?: string
    classNames?: AuthFormClassNames
    localization: Partial<AuthLocalization>
    onSuccess: () => Promise<void>
}

export function RecoverAccountForm({
    className,
    classNames,
    localization,
    onSuccess
}: RecoverAccountFormProps) {
    const { authClient, basePath, viewPaths, replace, toast } = useContext(AuthUIContext)

    const formSchema = z.object({
        code: z.string().min(1, { message: localization.backupCodeRequired })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { code: "" }
    })

    const isSubmitting = form.formState.isSubmitting

    const onSubmit = async ({ code }: z.infer<typeof formSchema>) => {
        try {
            await (authClient as AuthClient).twoFactor.verifyBackupCode({
                code,
                fetchOptions: { throw: true }
            })

            await onSuccess()
        } catch (error) {
            form.reset()
            toast({ variant: "error", message: getLocalizedError({ error, localization }) })

            if ((error as BetterFetchError).error.code === "INVALID_TWO_FACTOR_COOKIE") {
                replace(`${basePath}/${viewPaths.signIn}`)
            }
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
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
                                    {...field}
                                    placeholder={localization.backupCodePlaceholder}
                                    autoComplete="one-time-code"
                                    className={classNames?.input}
                                    disabled={isSubmitting}
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
                        localization.recoverAction
                    )}
                </Button>
            </form>
        </Form>
    )
}
