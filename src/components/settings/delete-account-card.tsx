import { useContext } from "react"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

import type { SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"

export function DeleteAccountCard({
    className,
    classNames,
    localization
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    localization?: Partial<typeof settingsLocalization>
}) {
    localization = { ...settingsLocalization, ...localization }

    const { deleteAccountVerification } = useContext(AuthUIContext)

    const deleteAccount = () => {
        if (deleteAccountVerification) {

        } else {

        }
    }

    const formAction = async (formData: FormData) => {

    }

    return (
        <Card className={cn("w-full max-w-lg overflow-hidden border-destructive", className, classNames?.base)}>
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
                    "border-t border-destructive bg-destructive/20 py-4 md:py-3",
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
                                placeholder={localization?.passwordPlaceholder}
                                type="password"
                            />
                        </div>

                        <DialogFooter>
                            <Button className="mx-auto md:ms-auto md:mx-0" variant="destructive">
                                {localization?.deleteAccount}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    )
}