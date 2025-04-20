import type { AuthLocalization } from "../../../lib/auth-localization"
import type { AuthFormClassNames } from "../auth-form"

export interface SignInFormProps {
    className?: string
    classNames?: AuthFormClassNames
    localization: Partial<AuthLocalization>
    onSuccess: () => Promise<void>
}

export function SignInForm({ className, classNames, localization, onSuccess }: SignInFormProps) {
    return <div>SignInForm</div>
}
