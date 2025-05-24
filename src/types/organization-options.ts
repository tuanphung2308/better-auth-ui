export type OrganizationOptions = {
    /**
     * Upload a logo image and return the URL string
     * @remarks `(file: File) => Promise<string>`
     */
    uploadLogo?: (file: File) => Promise<string | undefined | null>
    /**
     * Logo size for resizing
     * @default 256
     */
    logoSize?: number
    /**
     * File extension for logo uploads
     * @default "png"
     */
    logoExtension?: string
}
