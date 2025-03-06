import { RootProvider } from "fumadocs-ui/provider"
import { Geist } from "next/font/google"
import type { ReactNode } from "react"

import "./global.css"

const geistSans = Geist({
    subsets: ["latin"]
})

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.className} flex flex-col min-h-screen antialiased`}
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
