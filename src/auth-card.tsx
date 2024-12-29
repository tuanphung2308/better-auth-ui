import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormEvent, ReactNode, useEffect, useState } from "react"
import { AlertCircle, Loader2, MailIcon } from "lucide-react"
import {
    createAuthClient
} from "better-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type AuthClient = ReturnType<typeof createAuthClient>

type AuthView = "login" | "signup" | "forgot-password" | "reset-password" | "logout"

const DefaultLink = (
    { href, className, children }: { href: string, className?: string, children: ReactNode }
) => (
    <a href={href} className={className}>
        {children}
    </a>
)

interface AuthCardProps {
    authClient: AuthClient,
    navigate?: (url: string) => void
    pathname?: string
    initialView?: AuthView
    emailPassword?: boolean
    magicLink?: boolean
    startWithMagicLink?: boolean
    LinkComponent?: React.ComponentType<{ href: string, className?: string, children: ReactNode }>
}

export function AuthCard({
    authClient,
    navigate = (url) => window.location.href = url,
    pathname,
    initialView,
    emailPassword = true,
    magicLink,
    startWithMagicLink,
    LinkComponent = DefaultLink
}: AuthCardProps) {
    const { data: sessionData } = authClient.useSession()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState(initialView)
    const [isMagicLink, setIsMagicLink] = useState(startWithMagicLink || !emailPassword)
    const [alertMessage, setAlertMessage] = useState<string | null | undefined>()
    const [errorMessage, setErrorMessage] = useState<string | null | undefined>()

    const onSubmit = async (e: FormEvent) => {
        e?.preventDefault()

        setErrorMessage(null)
        setLoading(true)
        const { error } = await authClient.signIn.email({ email, password })
        setLoading(false)

        if (error) {
            setErrorMessage(error.message)
        }
    }

    useEffect(() => {
        console.log("sessionData", sessionData)
        if (sessionData && !(sessionData.user as any)?.isAnonymous) {
            navigate("/")
        }
    }, [sessionData])

    useEffect(() => {

    }, [pathname])

    return (
        <Card className="max-w-md w-full">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">
                    Login
                </CardTitle>

                <CardDescription className="text-xs md:text-sm">
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="grid" onSubmit={onSubmit}>
                    <div className="grid gap-2 mb-4">
                        <Label htmlFor="email">
                            Email
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            onChange={(e) => {
                                setEmail(e.target.value)
                            }}
                            value={email}
                        />
                    </div>

                    <div className="grid gap-2 mb-4">
                        <div className="flex items-center">
                            <Label htmlFor="password">
                                Password
                            </Label>

                            <a
                                href="/forgot-password"
                                className="ml-auto inline-block text-sm hover:underline"
                            >
                                Forgot your password?
                            </a>
                        </div>

                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div
                        className={cn(!errorMessage ? "scale-y-0 h-0" : "mb-4",
                            "overflow-hidden transition-all"
                        )}
                    >
                        <Alert
                            variant="destructive"
                            className="bg-destructive/10"
                        >
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="absolute top-5 right-4 text-foreground"
                            >
                                Resend
                            </Button>

                            <AlertCircle className="h-4 w-4" />

                            <AlertTitle>
                                Error
                            </AlertTitle>

                            <AlertDescription>
                                {errorMessage}
                                asdf
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "Login"
                            )}
                        </Button>

                        {magicLink && (
                            <LinkComponent href="/magic-link">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="gap-2 w-full"
                                >
                                    <MailIcon className="w-4 h-4" />
                                    Continue with Magic Link
                                </Button>
                            </LinkComponent>
                        )}
                    </div>
                </form>
            </CardContent>

            <CardFooter>
                <div className="flex justify-center w-full border-t pt-4">
                    <p className="text-center text-xs text-muted-foreground">
                        Don't have an account?
                        {" "}

                        <LinkComponent
                            href="/auth/signup"
                            className="underline"
                        >
                            <span className="dark:!text-warning text-foreground">
                                Sign Up
                            </span>
                        </LinkComponent>
                    </p>
                </div>
            </CardFooter>
        </Card>
    )
}