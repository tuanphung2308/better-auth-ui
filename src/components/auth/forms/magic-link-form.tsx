"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useIsHydrated } from "../../../hooks/use-hydrated"
import { useSearchParam } from "../../../hooks/use-search-param"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthClient } from "../../../types/auth-client"
import { Button } from "../../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import { Input } from "../../ui/input"
import type { AuthFormClassNames } from "../auth-form"

export interface MagicLinkFormProps {
    className?: string
    classNames?: AuthFormClassNames
    callbackURL?: string
    isLoading?: boolean
    localization: Partial<AuthLocalization>
    redirectTo?: string
}

export function MagicLinkForm({
    className,
    classNames,
    callbackURL,
    isLoading,
    localization,
    redirectTo
}: MagicLinkFormProps) {
    const isHydrated = useIsHydrated()

    const {
        authClient,
        basePath,
        baseURL,
        persistClient,
        redirectTo: contextRedirectTo,
        toast,
        viewPaths
    } = useContext(AuthUIContext)

    const redirectToParam = useSearchParam("redirectTo")
    redirectTo = redirectTo || redirectToParam || contextRedirectTo
    callbackURL =
        callbackURL ||
        `${baseURL}${persistClient ? `${basePath}/${viewPaths.callback}?redirectTo=${redirectTo}` : redirectTo}`

    const formSchema = z.object({
        email: z
            .string()
            .min(1, { message: `${localization.email} ${localization.isRequired}` })
            .email({ message: `${localization.email} ${localization.isInvalid}` })
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }
    })

    isLoading = isLoading || form.formState.isSubmitting

    async function sendMagicLink({ email }: z.infer<typeof formSchema>) {
        try {
            await (authClient as AuthClient).signIn.magicLink({
                email,
                callbackURL,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.magicLinkEmail
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
            <form
                onSubmit={form.handleSubmit(sendMagicLink)}
                noValidate={isHydrated}
                className={cn("grid w-full gap-6", className, classNames?.base)}
            >
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
                                    className={classNames?.input}
                                    type="email"
                                    placeholder={localization.emailPlaceholder}
                                    disabled={isLoading}
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className={classNames?.error} />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn("w-full", classNames?.button, classNames?.primaryButton)}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        localization.magicLinkAction
                    )}
                </Button>
            </form>
        </Form>
    )
}
