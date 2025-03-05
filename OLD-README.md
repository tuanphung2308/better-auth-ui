# @daveyplate/better-auth-ui

Plug & play shadcn/ui auth components for better-auth.

Fully customizable!

Coming Soon: Settings Cards, Email Templates, NextUI Port

[Documentation](https://better-auth-ui.com)

[Demo](https://newtech.dev/auth/login)

![better-auth-ui](screenshot.png)

## Installation

To install the package, run:

```bash
npm install @daveyplate/better-auth-ui@latest
```

Add the following to tailwind.config.ts:

```ts
content: [
	"./node_modules/@daveyplate/better-auth-ui/dist/**/*.{js,ts,jsx,tsx,mdx}"
]
```

Or if you're in Tailwind V4:

```css
@source "./node_modules/@daveyplate/better-auth-ui/dist/**/*.{js,ts,jsx,tsx,mdx}";
```

## Usage

```
When using a dynamic route it provides the following paths:
["login", "signup", "logout", "magic-link", "forgot-password", "reset-password", "logout"]
Customizable via authPaths prop.
```

### Next.js App Router

You must have shadcn/ui installed with CSS variables enabled.

Note: Toast is totally optional, it will render errors inline if not provided. This example uses shadcn/ui Toast.

If you are using protected middleware routes, `onSessionChange={() => router.refresh()}` is required to clear the router cache, otherwise the user won't be able to navigate to those pages until refreshing.

`app/auth/[auth]/page.tsx`
```tsx
import { authViews } from "@daveyplate/better-auth-ui"
import AuthView from "./auth-view"

export function generateStaticParams() {
    return authViews.map((auth) => ({ auth }))
}

export default function AuthPage() {
    return <AuthView />
}
```

`app/auth/[auth]/auth-view.tsx`
```tsx
"use client"

import { useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { AuthCard, AuthToastOptions } from "@daveyplate/better-auth-ui"
import { AuthToastOptions } from "@daveyplate/better-auth-ui"
import { authClient } from "@/lib/auth-client"

import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function AuthView() {
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()

    const redirectTo = "/"

    const authToast = useCallback((
        { variant, description, action }: AuthToastOptions
    ) => {
        toast({
            variant,
            description,
            action: action && (
                <ToastAction
                    altText={action.label}
                    onClick={action.onClick}
                >
                    {action.label}
                </ToastAction>
            )
        })
    }, [toast])

    return (
        <main className="flex flex-col items-center my-auto p-4">
            <AuthCard
                authClient={authClient}
                pathname={pathname}
                appRouter={router}
                providers={[
                    "github",
                ]}
                toast={authToast}
                redirectTo={redirectTo}
                LinkComponent={Link}
                disableAnimation={true}
                onSessionChange={() => router.refresh()}
            />
        </main>
    )
}
```



### Next.js Pages Router

If you don't provide a toast function, the AuthCard 
will render an inline Alert component for notifications.

`pages/auth/[auth].tsx`
```tsx
import { useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/router"

import { AuthCard, authViews } from "@daveyplate/better-auth-ui"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function AuthPage() {
    const nextRouter = useRouter()
    const { toast } = useToast()

    const redirectTo = "/"

    const authToast = useCallback((
        { variant, description, action }: AuthToastOptions
    ) => {
        toast({
            variant,
            description,
            action: action && (
                <ToastAction
                    altText={action.label}
                    onClick={action.onClick}
                >
                    {action.label}
                </ToastAction>
            )
        })
    }, [toast])

    return (
        <div className="flex justify-center items-center min-h-screen">
            <AuthCard 
                authClient={authClient} 
                nextRouter={nextRouter}
                providers={[
                    "github",
                ]}
                toast={authToast}
                redirectTo={redirectTo}
                LinkComponent={Link}
            />
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        authViews.map((auth) => {
            return { params: { auth } }
        }),
        fallback: false
    }
}
```

### React

To use Better Auth UI in a React project, follow these steps:

Use `disableRouting={true}` if you don't want to use a dynamic path.
Otherwise, navigate, pathname and LinkComponent are required.

`dynamic-auth-page-path.tsx`
```tsx
import { useNavigate, useLocation, NavLink } from "react-router-dom"
import { AuthCard } from "@daveyplate/better-auth-ui"

export default function AuthPage() {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="flex justify-center items-center min-h-screen">
            <AuthCard 
                authClient={authClient} 
                navigate={navigate} 
                pathname={location.pathname} 
                LinkComponent={NavLink} 
            />
        </div>
    )
}
```

## AuthCard Props

You can customize the AuthCard component by passing the following props:

| Prop Name         | Type                                                                 | Description                                                                                       | Default Value               |
|-------------------|----------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|-----------------------------|
| authClient        | `AuthClient`                                                         | The authentication client instance.                                                               | Required                    |
| navigate          | `(url: string) => void`                                              | Function to navigate to a different URL.                                                          | `undefined`           |
| pathname          | `string`                                                             | The current pathname.                                                                             | `undefined`  |
| nextRouter        | `NextRouter`                                                         | Next.js router instance.                                                                          | `undefined`                 |
| initialView       | `AuthView`                                                           | The initial view to display.                                                                      | `undefined`                 |
| emailPassword     | `boolean`                                                            | Enable email and password authentication.                                                         | `true`                      |
| username          | `boolean`                                                            | Enable username field for signup.                                                                 | `false`                     |
| forgotPassword    | `boolean`                                                            | Enable forgot password functionality.                                                             | `true`                      |
| magicLink         | `boolean`                                                            | Enable magic link authentication.                                                                 | `false`                     |
| passkey           | `boolean`                                                            | Enable passkey authentication.                                                                    | `false`                     |
| providers         | `SocialProvider[]`                                                   | List of social providers for authentication.                                                      | `[]`                        |
| socialLayout      | `"horizontal" \| "vertical"`                                         | Layout for social provider buttons.                                                               | `*automatic*`                |
| localization      | `Record<string, string>`                                | Localization strings for the component.                                                           | `undefined`       |
| disableRouting    | `boolean`                                                            | Disable internal routing.                                                                         | `false`                     |
| disableAnimation  | `boolean`                                                            | Disable animations.                                                                               | `false`                     |
| signUpWithName    | `boolean`                                                            | Enable name field for signup.                                                                     | `false`                     |
| redirectTo       | `string`                                                             | URL to client side navigate to after login, sign up or sign out. Defaults to `"/"`                                                          | `"/"`                       |
| callbackURL       | `string`                                                             | URL to hard navigate to after clicking on link in email, using passkey or connecting a provider, defaults to redirectTo.                                                          | `redirectTo`                       |
| authPaths         | `Record<AuthView, string>`                                  | Custom paths for authentication views.                                                            | `{}`                        |
| classNames        | `Record<string, string>`                                            | Custom class names for the component elements.                                                    | `{}`                        |
| componentStyle    | `"default" \| "new-york"`                                            | Style variant for the component.                                                                  | `"default"`                 |
| toast             | `(options: AuthToastOptions) => void`                                | Function to display toast notifications.                                                          | `undefined`                 |
| LinkComponent     | `React.ComponentType<{ href: string, to: any, className?: string, children: ReactNode }>` | Custom link component.                                                                            | `undefined`               |

## License

This project is licensed under the MIT License. See the LICENSE file for details.
