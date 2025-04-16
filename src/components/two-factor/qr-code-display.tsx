"use client"

import { QRCodeSVG } from "qrcode.react"
import { useContext, useEffect, useState } from "react"
import type { AuthLocalization } from "../../lib/auth-localization"
import { AuthUIContext } from "../../lib/auth-ui-provider"
import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"

interface QrCodeDisplayProps {
    uri: string
    size?: number
    className?: string
    /**
     * @default authLocalization
     * @remarks `AuthLocalization`
     */
    localization?: Partial<AuthLocalization>
}

export function QrCodeDisplay({
    uri,
    size = 200,
    className,
    localization: propLocalization
}: QrCodeDisplayProps) {
    const [mounted, setMounted] = useState(false)
    const { localization: authLocalization } = useContext(AuthUIContext)
    const localization = { ...authLocalization, ...propLocalization }

    useEffect(() => {
        setMounted(true)
    }, [])

    // If URI is empty, display an error message
    if (!uri) {
        return (
            <div className={cn("mx-auto w-full max-w-[240px]", className)}>
                <div className="mx-auto flex items-center justify-center p-4 text-center">
                    <div className="text-destructive text-sm">{localization.qrCodeMissing}</div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("flex w-full items-center justify-center", className)}>
            <div className="relative" style={{ width: size, height: size }}>
                {!mounted ? (
                    <Skeleton className="h-full w-full rounded-md" />
                ) : (
                    <QRCodeSVG
                        value={uri}
                        size={size}
                        level="H"
                        fgColor="currentColor"
                        bgColor="transparent"
                        className="mx-auto"
                    />
                )}
            </div>
        </div>
    )
}
