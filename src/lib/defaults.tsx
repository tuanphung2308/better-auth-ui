import type { ReactNode } from "react"

export const DefaultLink = (
    { href, className, children }: { href: string, className?: string, children: ReactNode }
) => (
    <a className={className} href={href} >
        {children}
    </a>
)

export const defaultNavigate = (href: string) => window.location.href = href

export type Link = React.ComponentType<{ href: string, to: unknown, className?: string, children: ReactNode }>