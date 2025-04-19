"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { type ComponentProps, useContext, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn, getLocalizedError } from "../../../lib/utils"
import type { AuthClient } from "../../../types/auth-client"
import { PasswordInput } from "../../password-input"
import { Button } from "../../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { BackupCodesDialog } from "./backup-codes-dialog"

interface TwoFactorPasswordDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    isTwoFactorEnabled: boolean
}

export function TwoFactorPasswordDialog({
    classNames,
    onOpenChange,
    isTwoFactorEnabled,
    ...props
}: TwoFactorPasswordDialogProps) {
    const { localization, authClient, basePath, viewPaths, navigate, toast, twoFactor } =
        useContext(AuthUIContext)
    const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false)
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [totpURI, setTotpURI] = useState<string | null>(null)

    const formSchema = z.object({
        password: z.string().min(1, { message: localization.passwordRequired })
    })

    const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { password: "" } })
    const { isSubmitting } = form.formState

    async function handleEnableTwoFactor({ password }: z.infer<typeof formSchema>) {
        try {
            const response = await (authClient as AuthClient).twoFactor.enable({
                password,
                fetchOptions: { throw: true }
            })

            onOpenChange?.(false)
            setBackupCodes(response.backupCodes)

            if (twoFactor?.includes("totp")) {
                setTotpURI(response.totpURI)
            }

            setTimeout(() => {
                setShowBackupCodesDialog(true)
            }, 250)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    async function handleDisableTwoFactor({ password }: z.infer<typeof formSchema>) {
        try {
            await (authClient as AuthClient).twoFactor.disable({
                password,
                fetchOptions: { throw: true }
            })

            toast({
                variant: "success",
                message: localization.twoFactorDisabled
            })

            onOpenChange?.(false)
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }
    }

    return (
        <>
            <Dialog onOpenChange={onOpenChange} {...props}>
                <DialogContent className={cn("sm:max-w-md", classNames?.dialog)}>
                    <DialogHeader className={classNames?.dialog?.header}>
                        <DialogTitle className={classNames?.title}>
                            {localization.twoFactor}
                        </DialogTitle>

                        <DialogDescription className={classNames?.description}>
                            {isTwoFactorEnabled
                                ? localization.twoFactorDisableInstructions
                                : localization.twoFactorEnableInstructions}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(
                                isTwoFactorEnabled ? handleDisableTwoFactor : handleEnableTwoFactor
                            )}
                            className="grid gap-4"
                        >
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={classNames?.label}>
                                            {localization.password}
                                        </FormLabel>

                                        <FormControl>
                                            <PasswordInput
                                                className={classNames?.input}
                                                placeholder={localization.passwordPlaceholder}
                                                autoComplete="current-password"
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
                                    variant="secondary"
                                    onClick={() => onOpenChange?.(false)}
                                    className={cn(classNames?.button, classNames?.secondaryButton)}
                                >
                                    {localization.cancel}
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={cn(classNames?.button, classNames?.primaryButton)}
                                >
                                    {isSubmitting && <Loader2 className="animate-spin" />}
                                    {isTwoFactorEnabled
                                        ? localization.disable
                                        : localization.enable}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <BackupCodesDialog
                classNames={classNames}
                open={showBackupCodesDialog}
                onOpenChange={(open) => {
                    setShowBackupCodesDialog(open)

                    if (!open) {
                        const url = `${basePath}/${viewPaths.twoFactor}`
                        navigate(
                            twoFactor?.includes("totp") && totpURI
                                ? `${url}?totpURI=${totpURI}`
                                : url
                        )
                    }
                }}
                backupCodes={backupCodes}
            />
        </>
    )
}
