import type { AuthLocalization } from "../../lib/auth-localization"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"

export function RememberMeCheckbox({ localization }: { localization: Partial<AuthLocalization> }) {
    return (
        <div className="flex items-center gap-2">
            <Checkbox id="rememberMe" name="rememberMe" />
            <Label htmlFor="rememberMe">{localization.rememberMe}</Label>
        </div>
    )
}
