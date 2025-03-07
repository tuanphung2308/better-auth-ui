import { ThemeToggle } from "fumadocs-ui/components/layout/theme-toggle"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import type { ReactNode } from "react"

import { baseOptions } from "@/app/layout.config"
import { source } from "@/lib/source"
import Separator from "./separator"

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <DocsLayout
            tree={source.pageTree}
            {...baseOptions}
            disableThemeSwitch
            sidebar={{
                footer: (
                    <ThemeToggle
                        className="ms-auto -mt-8"
                        mode="light-dark-system"
                    />
                ),
                components: {
                    Separator: Separator
                }
            }}
        >
            {children}
        </DocsLayout>
    )
}
