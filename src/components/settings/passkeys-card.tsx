import { FingerprintIcon, Loader2, PlusIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import type { PasskeyAuthClient } from "../../types/auth-client"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import type { SettingsCardClassNames } from "./settings-card"
import { ProvidersCardSkeleton } from "./skeletons/providers-card-skeleton"

type Passkey = {
    id: string
    name?: string
    publicKey: string
    userId: string
    credentialID: string
    counter: number
    deviceType: string
    backedUp: boolean
    transports?: string
    createdAt: Date
}

export interface PasskeysCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: AuthLocalization
}

export function PasskeysCard({
    className,
    classNames,
    isPending,
    localization
}: PasskeysCardProps) {
    const {
        authClient: contextAuthClient,
        hooks: { useListPasskeys },
        mutates: { deletePasskey },
        localization: authLocalization,
        optimistic
    } = useContext(AuthUIContext)
    const authClient = contextAuthClient as PasskeyAuthClient

    localization = { ...authLocalization, ...localization }

    const { data: passkeys, isPending: passkeysPending, refetch } = useListPasskeys()

    const [isLoading, setIsLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const addPasskey = async () => {
        setIsLoading(true)

        const response = await authClient.passkey.addPasskey()

        if (response?.error) {
            toast.error(response?.error.message || response?.error.statusText)
        } else {
            refetch()
        }

        setIsLoading(false)
    }

    const handleDeletePasskey = async (id: string) => {
        if (!optimistic) setActionLoading(id)

        const response = await deletePasskey({ id })

        if (response?.error) {
            toast.error(response?.error.message || response?.error.statusText)
        } else {
            refetch()
        }

        setActionLoading(null)
    }

    if (isPending || passkeysPending) {
        return <ProvidersCardSkeleton className={className} />
    }

    return (
        <Card className={cn("w-full overflow-hidden", className, classNames?.base)}>
            <CardHeader className={classNames?.header}>
                <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                    {localization.passkeys}
                </CardTitle>

                <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                    {localization.passkeysDescription}
                </CardDescription>
            </CardHeader>

            {!!passkeys?.length && (
                <CardContent className={cn("flex flex-col gap-3", classNames?.content)}>
                    {passkeys?.map((passkey) => {
                        const isButtonLoading = actionLoading === passkey.id

                        return (
                            <Card
                                key={passkey.id}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3",
                                    classNames?.cell
                                )}
                            >
                                <FingerprintIcon className="size-4" />

                                <span className="text-sm">
                                    {passkey.createdAt.toLocaleString()}
                                </span>

                                <Button
                                    className={cn("ms-auto relative", classNames?.button)}
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
                    "border-t bg-muted dark:bg-transparent py-4 md:py-3 flex flex-col md:flex-row gap-4 justify-between",
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
                            "flex gap-2 items-center",
                            isLoading ? "opacity-0" : "opacity-100"
                        )}
                    >
                        <PlusIcon />
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
