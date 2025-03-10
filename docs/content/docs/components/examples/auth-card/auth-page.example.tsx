import { AuthCard } from "@daveyplate/better-auth-ui"

export default function AuthPage({ params }: { params: { pathname: string } }) {
    return (
        <div className="flex flex-col grow size-full items-center justify-center gap-3">
            <AuthCard pathname={params.pathname} />
        </div>
    )
}
