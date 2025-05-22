import { type ComponentProps, useContext } from "react"
import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { cn } from "../../../lib/utils"
import { Button } from "../../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "../../ui/dialog"
import type { SettingsCardClassNames } from "./settings-card"

export interface SessionFreshnessDialogProps extends ComponentProps<typeof Dialog> {
    classNames?: SettingsCardClassNames
    localization?: AuthLocalization
    title?: string
    description?: string
}

export function SessionFreshnessDialog({
    classNames,
    localization,
    title,
    description,
    onOpenChange,
    ...props
}: SessionFreshnessDialogProps) {
    const {
        basePath,
        localization: contextLocalization,
        viewPaths,
        navigate
    } = useContext(AuthUIContext)

    localization = { ...contextLocalization, ...localization }

    const handleSignOut = () => {
        navigate(`${basePath}/${viewPaths.signOut}`)
        onOpenChange?.(false)
    }

    return (
        <Dialog onOpenChange={onOpenChange} {...props}>
            <DialogContent className={cn("sm:max-w-md", classNames?.dialog?.content)}>
                <DialogHeader className={classNames?.dialog?.header}>
                    <DialogTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {title || localization?.sessionExpired || "Session Expired"}
                    </DialogTitle>

                    <DialogDescription
                        className={cn("text-xs md:text-sm", classNames?.description)}
                    >
                        {description || localization?.sessionNotFresh}
                    </DialogDescription>
                </DialogHeader>

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
                        className={cn(classNames?.button, classNames?.primaryButton)}
                        variant="default"
                        onClick={handleSignOut}
                    >
                        {localization?.signOut}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
