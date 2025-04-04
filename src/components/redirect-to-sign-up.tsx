import { useAuthenticate } from "../hooks/use-authenticate"

export function RedirectToSignUp() {
    useAuthenticate({ authView: "signUp" })
    return null
}
