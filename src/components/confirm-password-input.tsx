"use client"

import type { ChangeEvent } from "react"

import { PasswordInput } from "./password-input"
import { Label } from "./ui/label"

export type AuthInputClassNames = {
    label?: string
    input?: string
}

export interface ConfirmPasswordInputProps {
    className?: string
    classNames?: AuthInputClassNames
    localization: {
        confirmPassword?: string
        confirmPasswordPlaceholder?: string
    }
    required?: boolean
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void
    autoComplete?: string
}

export function ConfirmPasswordInput({
    className,
    classNames,
    localization,
    required = true,
    onChange,
    autoComplete = "new-password"
}: ConfirmPasswordInputProps) {
    return (
        <div className={className || "grid gap-2"}>
            <div className="flex items-center">
                <Label className={classNames?.label} htmlFor="confirmPassword">
                    {localization.confirmPassword || "Confirm Password"}
                </Label>
            </div>

            <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete={autoComplete}
                className={classNames?.input}
                enableToggle
                placeholder={localization.confirmPasswordPlaceholder || "Confirm your password"}
                required={required}
                onChange={onChange}
            />
        </div>
    )
}
