"use client"

import { Trash2Icon, UploadCloudIcon } from "lucide-react"
import { useContext, useRef, useState } from "react"

import type { AuthLocalization } from "../../../lib/auth-localization"
import { AuthUIContext } from "../../../lib/auth-ui-provider"
import { fileToBase64, resizeAndCropImage } from "../../../lib/image-utils"
import { cn, getLocalizedError } from "../../../lib/utils"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../../ui/dropdown-menu"
import { UserAvatar } from "../../user-avatar"
import type { SettingsCardClassNames } from "../shared/settings-card"
import { SettingsCardFooter } from "../shared/settings-card-footer"
import { SettingsCardHeader } from "../shared/settings-card-header"

export interface UpdateAvatarCardProps {
    className?: string
    classNames?: SettingsCardClassNames
    isPending?: boolean
    localization?: AuthLocalization
}

export function UpdateAvatarCard({
    className,
    classNames,
    isPending: externalIsPending,
    localization
}: UpdateAvatarCardProps) {
    const {
        hooks: { useSession },
        mutators: { updateUser },
        localization: authLocalization,
        optimistic,
        avatar,
        toast
    } = useContext(AuthUIContext)

    localization = { ...authLocalization, ...localization }

    const { data: sessionData, isPending: sessionPending } = useSession()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [loading, setLoading] = useState(false)

    const handleAvatarChange = async (file: File) => {
        if (!sessionData || !avatar) return

        setLoading(true)
        const resizedFile = await resizeAndCropImage(
            file,
            crypto.randomUUID(),
            avatar.size,
            avatar.extension
        )

        let image: string | undefined | null

        if (avatar.upload) {
            image = await avatar.upload(resizedFile)
        } else {
            image = await fileToBase64(resizedFile)
        }

        if (!image) {
            setLoading(false)
            return
        }

        if (optimistic && !avatar.upload) setLoading(false)

        try {
            await updateUser({ image })
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setLoading(false)
    }

    const handleDeleteAvatar = async () => {
        if (!sessionData) return

        setLoading(true)

        try {
            await updateUser({ image: null })
        } catch (error) {
            toast({
                variant: "error",
                message: getLocalizedError({ error, localization })
            })
        }

        setLoading(false)
    }

    const openFileDialog = () => fileInputRef.current?.click()

    const isPending = externalIsPending || sessionPending

    return (
        <Card className={cn("w-full pb-0 text-start", className, classNames?.base)}>
            <input
                ref={fileInputRef}
                accept="image/*"
                disabled={loading}
                hidden
                type="file"
                onChange={(e) => {
                    const file = e.target.files?.item(0)
                    if (file) handleAvatarChange(file)

                    e.target.value = ""
                }}
            />

            <div className="flex justify-between">
                <SettingsCardHeader
                    className="grow self-start"
                    title={localization.avatar}
                    description={localization.avatarDescription}
                    isPending={isPending}
                    classNames={classNames}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            className="!size-fit me-6 rounded-full"
                            size="icon"
                        >
                            <UserAvatar
                                isPending={isPending || loading}
                                key={sessionData?.user.image}
                                className="size-20 text-2xl"
                                classNames={classNames?.avatar}
                                user={sessionData?.user}
                            />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                        <DropdownMenuItem onClick={openFileDialog} disabled={loading}>
                            <UploadCloudIcon />
                            {localization.uploadAvatar}
                        </DropdownMenuItem>
                        {sessionData?.user.image && (
                            <DropdownMenuItem
                                onClick={handleDeleteAvatar}
                                disabled={loading}
                                variant="destructive"
                            >
                                <Trash2Icon />
                                {localization.deleteAvatar}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <SettingsCardFooter
                className="!py-5"
                instructions={localization.avatarInstructions}
                classNames={classNames}
                isPending={isPending}
                isSubmitting={loading}
            />
        </Card>
    )
}
