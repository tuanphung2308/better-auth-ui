import { FingerprintIcon, Loader2 } from "lucide-react"
import { useContext, useState } from "react"

import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { getErrorMessage } from "../../lib/get-error-message"
import { cn } from "../../lib/utils"
import type { AuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import type { SettingsCardClassNames } from "./settings-card"
import { ProvidersCardSkeleton } from "./skeletons/providers-card-skeleton"

export interface PasskeysCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
    passkeys?: { id: string; createdAt: Date }[] | null
    skipHook?: boolean
    refetch?: () => Promise<void>
}

export function PasskeysCard({
    className,
    classNames,
    isPending,
    localization,
    passkeys,
    skipHook,
    refetch
}: PasskeysCardProps) {
    const {
        authClient,
        hooks: { useListPasskeys },
        mutators: { deletePasskey },
        localization: authLocalization,
        toast
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    if (!skipHook) {
        const result = useListPasskeys()
        passkeys = result.data
        isPending = result.isPending
        refetch = result.refetch
    }

    const [isLoading, setIsLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const addPasskey = async () => {
        setIsLoading(true)

        const response = await (authClient as AuthClient).passkey.addPasskey()
        const error = response?.error
        if (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
        } else {
            await refetch?.()
        }

        setIsLoading(false)
    }

    const handleDeletePasskey = async (id: string) => {
        setActionLoading(id)

        try {
            await deletePasskey({ id })
            refetch?.()
        } catch (error) {
            toast({
                variant: "error",
                message: getErrorMessage(error) || localization.requestFailed
            })
            setActionLoading(null)
        }
    }

    if (isPending) {
        return <ProvidersCardSkeleton className={className} classNames={classNames} />
    }

    return (
        <Card className={cn("w-full pb-0", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization.passkeys}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {localization.passkeysDescription}
                </CardDescription>
            </CardHeader>

            {!!passkeys?.length && (
                <CardContent className={cn("flex flex-col gap-4", classNames?.content)}>
                    {passkeys?.map((passkey) => {
                        const isButtonLoading = actionLoading === passkey.id

                        return (
                            <Card
                                key={passkey.id}
                                className={cn(
                                    "flex-row items-center gap-3 px-4 py-3",
                                    classNames?.cell
                                )}
                            >
                                <FingerprintIcon className="size-4" />

                                <span className="text-sm">
                                    {passkey.createdAt.toLocaleString()}
                                </span>

                                <Button
                                    className={cn("relative ms-auto", classNames?.button)}
                                    disabled={isButtonLoading}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        handleDeletePasskey(passkey.id)
                                    }}
                                >
                                    <span className={isButtonLoading ? "opacity-0" : "opacity-100"}>
                                        {localization.delete}
                                    </span>

                                    {isButtonLoading && (
                                        <span className="absolute">
                                            <Loader2 className="animate-spin" />
                                        </span>
                                    )}
                                </Button>
                            </Card>
                        )
                    })}
                </CardContent>
            )}

            <CardFooter
                className={cn(
                    "flex flex-col justify-between gap-4 rounded-b-xl border-t bg-muted pb-6 md:flex-row dark:bg-transparent",
                    classNames?.footer
                )}
            >
                {localization.passkeysInstructions && (
                    <CardDescription className={cn("text-xs md:text-sm", classNames?.instructions)}>
                        {localization.passkeysInstructions}
                    </CardDescription>
                )}

                <Button
                    className={cn("md:ms-auto", classNames?.button)}
                    size="sm"
                    onClick={addPasskey}
                    disabled={isLoading}
                >
                    <span
                        className={cn(
                            "flex items-center gap-2",
                            isLoading ? "opacity-0" : "opacity-100"
                        )}
                    >
                        {localization.addPasskey}
                    </span>

                    {isLoading && (
                        <span className="absolute">
                            <Loader2 className="animate-spin" />
                        </span>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
//     return (
//         <div className="grid gap-4 py-4">
//             <div className="space-y-2">
//                 {passkeys?.map((passkey, index) => (
//                     <div
//                         key={passkey.id}
//                         className="flex items-center justify-between border p-2 rounded-md"
//                     >
//                         <div className="flex-1">
//                             <div className="font-medium">
//                                 {passkey.name ?? `Passkey ${index + 1}`}
//                             </div>
//                             <div className="text-xs text-muted-foreground">
//                                 Created at {passkey.createdAt}
//                             </div>
//                         </div>
//                         <Button
//                             size="icon"
//                             onClick={() =>
//                                 // @ts-expect-error Optional plugin
//                                 authClient.passkey.deletePasskey({
//                                     id: passkey.id
//                                 })
//                             }
//                             variant="destructive"
//                         >
//                             <TrashIcon className="h-4 w-4" />
//                         </Button>
//                     </div>
//                 ))}

//                 {!passkeys?.length && (
//                     <div className="text-sm text-muted-foreground text-center py-2">
//                         No passkeys added yet.
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }
