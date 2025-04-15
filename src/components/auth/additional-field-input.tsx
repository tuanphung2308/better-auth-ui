import { cn } from "../../lib/utils"
import type { AdditionalField } from "../../types/additional-fields"
import { Checkbox } from "../ui/checkbox"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import type { AuthFormClassNames } from "./auth-form"

interface AdditionalFieldInputProps {
    field: string
    additionalField: AdditionalField
    classNames?: AuthFormClassNames
}

export function AdditionalFieldInput({
    field,
    additionalField,
    classNames
}: AdditionalFieldInputProps) {
    return additionalField.type === "boolean" ? (
        <div className="flex items-center gap-2">
            <Checkbox id={field} name={field} required={additionalField.required} />

            <Label className={cn(classNames?.label)} htmlFor={field}>
                {additionalField.label}
            </Label>
        </div>
    ) : (
        <div className="grid gap-2">
            <Label className={classNames?.label} htmlFor={field}>
                {additionalField.label}
            </Label>

            <Input
                className={classNames?.input}
                id={field}
                name={field}
                placeholder={
                    additionalField.placeholder ||
                    (typeof additionalField.label === "string" ? additionalField.label : "")
                }
                required={additionalField.required}
                type={additionalField.type === "number" ? "number" : "text"}
            />
        </div>
    )
}
