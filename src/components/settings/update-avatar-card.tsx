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
import { UserAvatar } from "../user-avatar"

import type { SettingsCardClassNames } from "./settings-card"
import type { settingsLocalization } from "./settings-cards"
import { UpdateAvatarCardSkeleton } from "./skeletons/update-avatar-card-skeleton"

async function resizeAndCropImage(file: File, size: number): Promise<string> {
    const image = await loadImage(file)

    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = size

    const ctx = canvas.getContext("2d")!

    const minEdge = Math.min(image.width, image.height)

    const sx = (image.width - minEdge) / 2
    const sy = (image.height - minEdge) / 2
    const sWidth = minEdge
    const sHeight = minEdge

    const dWidth = minEdge > size ? size : minEdge
    const dHeight = dWidth

    canvas.width = canvas.height = dWidth

    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight)

    return canvas.toDataURL("image/png")
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
    const { hooks: { useSession }, avatarSize } = useContext(AuthUIContext)
    const { data: sessionData, isPending: sessionPending, updateUser } = useSession()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [loading, setLoading] = useState(false)

    const handleAvatarChange = async (file: File) => {
        setLoading(true)
        try {
            const image = await resizeAndCropImage(file, avatarSize)
            const { error } = await updateUser({ image })
            if (error) {
                toast.error(error.message || "Could not update profile image.")
            } else {
                toast.success("Profile image updated successfully.")
            }
        } catch (err) {
            toast.error("Failed to resize and crop image.")
        }
        setLoading(false)
    }

    const openFileDialog = () => fileInputRef.current?.click()

    if (isPending || sessionPending) return <UpdateAvatarCardSkeleton classNames={classNames} />

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
                        Avatar
                    </CardTitle>

                    <CardDescription className={cn("text-xs md:text-sm", classNames?.description)}>
                        Click on the avatar to upload a custom one from your files.
                    </CardDescription>
                </CardHeader>

                <button
                    className={cn("me-6 my-5")}
                    type="button"
                    onClick={openFileDialog}
                >
                    <UserAvatar
                        className="size-18 text-2xl"
                        classNames={classNames?.avatar}
                        user={sessionData?.user}
                    />
                </button>
            </div>

            <CardFooter
                className={cn(
                    "border-t bg-muted dark:bg-transparent py-4",
                    classNames?.footer
                )}
            >
                <CardDescription className={cn("text-xs text-center mx-auto md:text-sm md:mx-0 md:text-left", classNames?.instructions)}>
                    An avatar is optional but strongly recommended.
                </CardDescription>
            </CardFooter>
        </Card>
    )
}