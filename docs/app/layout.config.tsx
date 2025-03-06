import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { ExternalLink, Twitter } from "lucide-react"

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
    githubUrl: "https://github.com/daveyplate/better-auth-ui",
    nav: {
        // can be JSX too!
        title: (
            <>
                <svg className="w-5 h-5" fill="none" height="45" viewBox="0 0 60 45" width="60" xmlns="http://www.w3.org/2000/svg">
                    <path className="fill-black dark:fill-white" clipRule="evenodd" d="M0 0H15V15H30V30H15V45H0V30V15V0ZM45 30V15H30V0H45H60V15V30V45H45H30V30H45Z" fill-rule="evenodd" />
                </svg>
                BETTER-AUTH. UI
            </>

        ),
    },
    links: [
        {
            url: "https://newtech.dev/auth/sign-in",
            text: "Demo",
            type: "button",
            icon: <ExternalLink />,
            external: true
        },
        {
            url: "https://x.com/daveycodez",
            text: "Twitter",
            type: "icon",
            icon: <Twitter />,
            external: true
        }
    ]
}
