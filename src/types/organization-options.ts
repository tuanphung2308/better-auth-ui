export type OrganizationLogoOptions = {
    /**
     * Upload a logo image and return the URL string
     * @remarks `(file: File) => Promise<string>`
     */
    upload?: (file: File) => Promise<string | undefined | null>
    /**
     * Delete a previously uploaded logo image from your storage/CDN
     * @remarks `(url: string) => Promise<void>`
     */
    delete?: (url: string) => Promise<void>
    /**
     * Logo size for resizing
     * @default 256 if upload is provided, 128 otherwise
     */
    size: number
    /**
     * File extension for logo uploads
     * @default "png"
     */
    extension: string
}

export type OrganizationOptions = {
    /**
     * Logo configuration
     * @default undefined
     */
    logo?: boolean | Partial<OrganizationLogoOptions>
    /**
     * Custom roles to add to the built-in roles (owner, admin, member)
     * @default []
     */
    customRoles?: Array<{ role: string; label: string }>
    /**
     * Enable or disable API key support for organizations
     * @default false
     */
    apiKey?: boolean
}

export type OrganizationOptionsContext = {
    /**
     * Logo configuration
     * @default undefined
     */
    logo?: OrganizationLogoOptions
    /**
     * Custom roles to add to the built-in roles (owner, admin, member)
     * @default []
     */
    customRoles: Array<{ role: string; label: string }>
    /**
     * Enable or disable API key support for organizations
     * @default false
     */
    apiKey?: boolean
}
