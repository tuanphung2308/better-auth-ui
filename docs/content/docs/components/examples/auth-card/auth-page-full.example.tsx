import { AuthCard } from "@daveyplate/better-auth-ui"

export default function AuthPage({ params }: { params: { pathname: string } }) {
    return (
        <div className="flex justify-center my-auto">
            <AuthCard
                pathname={params.pathname}
                socialLayout="grid"
                providers={["github", "google", "discord"]}
                redirectTo="/home"
                localization={{
                    signUp: "Create an Account",
                    signIn: "Sign In",
                    magicLink: "Sign In via Email"
                }}
                classNames={{
                    base: "border-destructive",
                    form: {
                        input: "placeholder:text-red-500",
                        label: "text-destructive"
                    },
                    title: "text-destructive"
                }}
            />
        </div>
    )
}
