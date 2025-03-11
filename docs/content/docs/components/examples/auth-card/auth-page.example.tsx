import { AuthCard } from "@daveyplate/better-auth-ui"

export default function AuthPage({ params }: { params: { pathname: string } }) {
    return (
        <div className="flex size-full grow flex-col items-center justify-center gap-3">
            <AuthCard pathname={params.pathname} />
        </div>
    )
}
