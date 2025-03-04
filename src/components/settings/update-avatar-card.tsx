"use client"

import { useContext, useRef, useState } from "react"
import { toast } from "sonner"

import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { UserAvatar } from "../user-avatar"

import type { SettingsCardClassNames } from "./settings-card"
import { settingsLocalization } from "./settings-cards"
import { UpdateAvatarCardSkeleton } from "./skeletons/update-avatar-card-skeleton"

async function resizeAndCropImage(file: File, name: string, size: number, avatarExtension: string): Promise<File> {
    const image = await loadImage(file)

    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = size

    const ctx = canvas.getContext("2d")!

    const minEdge = Math.min(image.width, image.height)

    const sx = (image.width - minEdge) / 2
    const sy = (image.height - minEdge) / 2
    const sWidth = minEdge
    const sHeight = minEdge

    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, size, size)

    const resizedImageBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, `image/${avatarExtension}`)
    )

    return new File([resizedImageBlob!], `${name}.${avatarExtension}`, { type: `image/${avatarExtension}` })
}

async function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        const reader = new FileReader()

        reader.onload = (e) => {
            image.src = e.target!.result as string
        }

        image.onload = () => resolve(image)
        image.onerror = (err) => reject(err)

        reader.readAsDataURL(file)
    })
}

export function UpdateAvatarCard({
    className,
    classNames,
    isPending,
    localization,
}: {
    className?: string,
    classNames?: SettingsCardClassNames,
    isPending?: boolean,
    localization?: Partial<typeof settingsLocalization>
}) {
    localization = { ...settingsLocalization, ...localization }

    const { hooks: { useSession }, optimistic, uploadAvatar, avatarSize, avatarExtension } = useContext(AuthUIContext)

    const { data: sessionData, isPending: sessionPending, updateUser } = useSession()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [loading, setLoading] = useState(false)

    const handleAvatarChange = async (file: File) => {
        if (!sessionData) return

        setLoading(true)
        const resizedFile = await resizeAndCropImage(file, sessionData.user.id, avatarSize, avatarExtension)

        let image: string | undefined | null

        if (uploadAvatar) {
            image = await uploadAvatar(resizedFile)
        } else {
            image = await fileToBase64(resizedFile)
        }

        if (!image) {
            setLoading(false)
            return
        }

        if (optimistic && !uploadAvatar) setLoading(false)

        const { error } = await updateUser({ image })

        if (error) {
            toast.error(error.message || error.statusText)
        }

        setLoading(false)
    }

    const openFileDialog = () => fileInputRef.current?.click()

    if (isPending || sessionPending) {
        return <UpdateAvatarCardSkeleton classNames={classNames} />
    }

    return (
        <Card className={cn("w-full overflow-hidden", className, classNames?.base)}>
            <input
                ref={fileInputRef}
                accept="image/*"
                disabled={loading}
                hidden
                type="file"
                onChange={(e) => {
                    const file = e.target.files?.item(0)
                    if (file) handleAvatarChange(file)
                }}
            />

            <div className="flex justify-between">
                <CardHeader className={cn(classNames?.header)}>
                    <CardTitle className={cn("text-lg md:text-xl", classNames?.title)}>
                        {localization.avatar}
                    </CardTitle>

                    <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                        {localization.avatarDescription}
                    </CardDescription>
                </CardHeader>

                <button
                    className={cn("me-6 my-5")}
                    type="button"
                    onClick={openFileDialog}
                >
                    {loading ? (
                        <Skeleton className={cn("size-18 rounded-full", classNames?.avatar?.base)} />
                    ) : (
                        <UserAvatar
                            className="size-18 text-2xl"
                            classNames={classNames?.avatar}
                            user={sessionData?.user}
                        />
                    )}

                </button>
            </div>

            <CardFooter
                className={cn(
                    "border-t bg-muted dark:bg-transparent py-4.5",
                    classNames?.footer
                )}
            >
                <CardDescription
                    className={cn(
                        "text-xs text-center mx-auto md:text-sm md:mx-0 md:text-left",
                        classNames?.instructions
                    )}
                >
                    {localization.avatarInstructions}
                </CardDescription>
            </CardFooter>
        </Card>
    )
}

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}