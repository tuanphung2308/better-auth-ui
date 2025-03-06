import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Tailwind,
    Text
} from "@react-email/components"
import type { ReactNode } from "react"

import { cn } from "../../lib/utils"

export interface EmailTemplateClassNames {
    body?: string
    button?: string
    container?: string
    content?: string
    footer?: string
    heading?: string
    hr?: string
    link?: string
}

export interface EmailTemplateProps {
    classNames?: EmailTemplateClassNames
    action: string
    /** @default process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL */
    baseUrl?: string
    content: ReactNode
    heading: ReactNode
    /** @default `${baseUrl}/apple-touch-icon.png` */
    imageUrl?: string
    preview?: string
    /** @default process.env.SITE_NAME || process.env.NEXT_PUBLIC_SITE_NAME */
    siteName?: string
    url: string
    /** @default "vercel" */
    variant?: "vercel"
}

export const EmailTemplate = ({
    classNames,
    action,
    baseUrl,
    content,
    heading,
    imageUrl,
    preview,
    siteName,
    variant = "vercel",
    url
}: EmailTemplateProps) => {
    baseUrl = baseUrl || process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL
    imageUrl = imageUrl || `${baseUrl}/apple-touch-icon.png`
    siteName = siteName || process.env.SITE_NAME || process.env.NEXT_PUBLIC_SITE_NAME
    preview = preview || (typeof heading === "string" ? heading : undefined)

    return (
        <Html>
            <Head>
                <meta name="x-apple-disable-message-reformatting" />
                <meta content="light dark" name="color-scheme" />
                <meta content="light dark" name="supported-color-schemes" />

                <style type="text/css">
                    {`
                        :root {
                            color-scheme: light dark;
                            supported-color-schemes: light dark;
                        }
                    `}
                </style>

                <style type="text/css">
                    {`      
                        html, body {
                            background-color: #ffffff;
                            color: #000000;
                        }

                        a {
                            color: #000000;
                        }

                        .border-color {
                            border-color: #eaeaea;
                        }

                        .action-button {
                            background-color: #000000 !important;
                            color: #ffffff !important;
                        }

                        @media (prefers-color-scheme: dark) {
                            html, body {
                                background-color: #000000 !important;
                                color: #ffffff !important;
                            }

                            a {
                                color: #ffffff;
                            }

                            .border-color {
                                border-color: #333333 !important;
                            }

                            .action-button {
                                background-color: rgb(38, 38, 38) !important;
                                color: #ffffff !important;
                            }
                        }
                    `}
                </style>
            </Head>

            {preview && <Preview>{preview}</Preview>}

            <Tailwind>
                <Body className={cn("my-auto mx-auto font-sans px-2", classNames?.body)}>
                    <Container className="border border-solid border-color rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                alt={siteName}
                                className="my-0 mx-auto rounded-full"
                                height="40"
                                src={imageUrl}
                                width="40"
                            />
                        </Section>

                        <Heading
                            className={cn(
                                "text-[24px] font-bold text-center p-0 my-[30px] mx-0",
                                classNames?.heading
                            )}
                        >
                            {heading}
                        </Heading>

                        <Text className={cn("text-[14px] leading-[24px]", classNames?.content)}>
                            {content}
                        </Text>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className={cn(
                                    "action-button rounded text-[12px] font-semibold no-underline text-center px-5 py-3",
                                    classNames?.button
                                )}
                                href={url}
                            >
                                {action}
                            </Button>
                        </Section>

                        <Hr
                            className={cn(
                                "border border-solid border-color my-[26px] mx-0 w-full",
                                classNames?.hr
                            )}
                        />

                        <Text
                            className={cn(
                                "text-[#666666] text-[12px] leading-[24px]",
                                classNames?.footer
                            )}
                        >
                            {siteName && <>{siteName} </>}

                            {baseUrl && (
                                <Link
                                    className={cn("no-underline", classNames?.link)}
                                    href={baseUrl}
                                >
                                    {baseUrl?.replace("https://", "").replace("http://", "")}
                                </Link>
                            )}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
