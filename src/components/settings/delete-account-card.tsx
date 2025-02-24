import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../ui/card"

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

    const formAction = async (formData: FormData) => {

    }

    return (
        <Card className={cn("w-full max-w-lg overflow-hidden border-destructive", className, classNames?.base)}>
            <form action={formAction}>
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
                    <Button className={cn("md:ms-auto", classNames?.saveButton)} size="sm" variant="destructive">
                        {localization?.deleteAccount}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}