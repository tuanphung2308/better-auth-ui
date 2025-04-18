import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext } from "react"
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
import type { SettingsCardClassNames } from "./shared/settings-card"

export interface DeleteAccountDialogProps extends ComponentProps<typeof Dialog> {
    accounts?: { provider: string }[] | null
    localization?: AuthLocalization
    className?: string
    classNames?: SettingsCardClassNames
}

export function DeleteAccountDialog({
    open,
    onOpenChange,
    accounts,
    localization,
    classNames,
    ...props
}: DeleteAccountDialogProps) {
    const {
        authClient,
        basePath,
        deleteAccountVerification,
        freshAge,
        hooks: { useSession },
        localization: contextLocalization,
        navigate,
        toast,
        viewPaths
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const { data: sessionData } = useSession()
    const session = sessionData?.session

    const isFresh = session ? Date.now() - session?.createdAt.getTime() < freshAge * 1000 : false
    const credentialsLinked = accounts?.some((acc) => acc.provider === "credential")

    const formSchema = z.object({
        password: credentialsLinked
            ? z.string().min(1, { message: localization.passwordRequired! })
            : z.string().optional()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: ""
        }
    })

    const { isSubmitting } = form.formState

    const deleteAccount = async ({ password }: z.infer<typeof formSchema>) => {
        const params = {} as Record<string, string>

        if (credentialsLinked) {
            params.password = password!
        } else if (!isFresh) {
            navigate(`${basePath}/${viewPaths.signOut}`)
            return
        }

        if (deleteAccountVerification) {
            params.callbackURL = `${basePath}/${viewPaths.signOut}`
        }

        try {
            await authClient.deleteUser({
                ...params,
                fetchOptions: {
                    throw: true
                }
            })

            if (deleteAccountVerification) {
                toast({ variant: "success", message: localization.deleteAccountVerify! })
            } else {
                toast({ variant: "success", message: localization.deleteAccountSuccess! })
                navigate(`${basePath}/${viewPaths.signOut}`)
            }
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        onOpenChange?.(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            <DialogContent className={cn("sm:max-w-md", classNames?.dialog?.content)}>
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization?.deleteAccount}
                    </DialogTitle>

                    <DialogDescription
                        className={cn("text-xs md:text-sm", classNames?.description)}
                    >
                        {isFresh
                            ? localization?.deleteAccountInstructions
                            : localization?.deleteAccountNotFresh}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(deleteAccount)} className="grid gap-4">
                        {credentialsLinked && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={classNames?.label}>
                                            {localization?.password}
                                        </FormLabel>

                                        <FormControl>
                                            <Input
                                                autoComplete="current-password"
                                                placeholder={localization?.passwordPlaceholder}
                                                type="password"
                                                className={classNames?.input}
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className={classNames?.dialog?.footer}>
                            <Button
                                type="button"
                                variant="secondary"
                                className={cn(classNames?.button, classNames?.secondaryButton)}
                                onClick={() => onOpenChange?.(false)}
                            >
                                {localization.cancel}
                            </Button>

                            <Button
                                className={cn(classNames?.button, classNames?.destructiveButton)}
                                disabled={isSubmitting}
                                variant="destructive"
                                type="submit"
                            >
                                {isSubmitting && <Loader2 className="animate-spin" />}
                                {isFresh ? localization?.deleteAccount : localization?.signOut}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
