import { RootProvider } from "fumadocs-ui/provider"
import { Geist } from "next/font/google"
import type { ReactNode } from "react"

import "./global.css"
import { baseUrl, createMetadata } from "@/lib/metadata"

const geistSans = Geist({
    subsets: ["latin"]
})

export const metadata = createMetadata({
    title: {
        template: "%s | Better Auth UI",
        default: "Better Auth UI"
    },
    description:
        "UI components for the most comprehensive authentication library for TypeScript.",
    metadataBase: baseUrl
})

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.className} flex min-h-screen flex-col antialiased`}
            >
                <RootProvider
                    search={{
                        options: {
                            type: "static"
                        }
                    }}
                    theme={{
                        attribute: "class"
                    }}
                >
                    {children}
                </RootProvider>
            </body>
        </html>
    )
}
