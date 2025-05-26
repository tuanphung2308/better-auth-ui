export type OrganizationLogoOptions = {
    /**
     * Upload a logo image and return the URL string
     * @remarks `(file: File) => Promise<string>`
     */
    upload?: (file: File) => Promise<string | undefined | null>
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

export type OrganizationPermissionResource = "organization" | "member" | "invitation"

export type OrganizationPermissionAction = "create" | "update" | "delete" | "cancel"

export type OrganizationRolePermissions = {
    organization?: OrganizationPermissionAction[]
    member?: OrganizationPermissionAction[]
    invitation?: OrganizationPermissionAction[]
}

export type OrganizationPermissions = {
    owner?: OrganizationRolePermissions
    admin?: OrganizationRolePermissions
    member?: OrganizationRolePermissions
}

export type OrganizationOptions = {
    /**
     * Logo configuration
     * @default undefined
     */
    logo?: boolean | Partial<OrganizationLogoOptions>
    /**
     * Permissions configuration for organization roles
     * @default Better Auth defaults (owner: full access, admin: organization update/delete + member/invitation CRUD except org delete, member: limited access)
     */
    permissions?: OrganizationPermissions
}

export type OrganizationOptionsContext = {
    /**
     * Logo configuration
     * @default undefined
     */
    logo?: OrganizationLogoOptions
    /**
     * Permissions configuration for organization roles
     * @default Better Auth defaults
     */
    permissions?: OrganizationPermissions
}
