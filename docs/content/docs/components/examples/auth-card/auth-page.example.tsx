import { AuthCard } from "@daveyplate/better-auth-ui"

export default function AuthPage({ params }: { params: { pathname: string } }) {
    return (
        <div className="flex justify-center my-auto">
            <AuthCard pathname={params.pathname} />
        </div>
    )
}
