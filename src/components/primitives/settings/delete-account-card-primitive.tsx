import { Loader2 } from "lucide-react"
import { useActionState, useContext } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import { type SettingsCardClassNames } from "../../settings/settings-card"
import { settingsLocalization } from "../../settings/settings-cards"
import { DeleteAccountCardSkeleton } from "../../settings/skeletons/delete-account-card-skeleton"
import { Button } from "../../ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../../ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"

export function DeleteAccountCardPrimitive({
    className,
    classNames,
    isPending,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    isPending: boolean,
    localization?: Partial<typeof settingsLocalization>
}) {
    localization = { ...settingsLocalization, ...localization }

    const { authClient, basePath, deleteAccountVerification, viewPaths, navigate } = useContext(AuthUIContext)

    const formAction = async (_: unknown, formData: FormData) => {
        const password = formData.get("password") as string
        const params = { password } as Record<string, string>

        if (deleteAccountVerification) {
            params.callbackURL = `${basePath}/${viewPaths.signOut}`
        }

        const { error } = await authClient.deleteUser(params)

        if (error) {
            toast.error(error.message || error.statusText)
        } else {
            if (deleteAccountVerification) {
                toast(localization?.deleteAccountEmail)
            } else {
                toast.success(localization?.deleteAccountSuccess)
                navigate(`${basePath}/${viewPaths.signOut}`)
            }
        }
    }

    const [_, action, isSubmitting] = useActionState(formAction, null)

    if (isPending) {
        return <DeleteAccountCardSkeleton className={className} classNames={classNames} />
    }

    return (
        <Card className={cn("w-full max-w-lg overflow-hidden border-destructive/40", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization?.deleteAccount}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {localization?.deleteAccountDescription}
                </CardDescription>
            </CardHeader>

            <CardFooter
                className={cn(
                    "border-t border-destructive/30 bg-destructive/10 py-4 md:py-3",
                    classNames?.footer
                )}
            >
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className={cn("mx-auto md:ms-auto md:mx-0", classNames?.saveButton)}
                            size="sm"
                            variant="destructive"
                        >
                            {localization?.deleteAccount}
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                        <form action={action} className="grid gap-4">
                            <DialogHeader>
                                <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                                    {localization?.deleteAccount}
                                </DialogTitle>

                                <DialogDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                                    {localization?.deleteAccountInstructions}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {localization?.password}
                                </Label>

                                <Input
                                    autoComplete="current-password"
                                    id="password"
                                    name="password"
                                    placeholder={localization?.passwordPlaceholder}
                                    required
                                    type="password"
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    className="mx-auto md:ms-auto md:mx-0"
                                    disabled={isSubmitting}
                                    variant="destructive"
                                >
                                    <span className={cn(isSubmitting && "opacity-0")}>
                                        {localization?.deleteAccount}
                                    </span>

                                    {isSubmitting && (
                                        <span className="absolute">
                                            <Loader2 className="animate-spin" />
                                        </span>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    )
}