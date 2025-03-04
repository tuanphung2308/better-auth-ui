import { loader } from "fumadocs-core/source"
import { createMDXSource } from "fumadocs-mdx"
import { icons } from "lucide-react"
import { createElement } from "react"

import { docs, meta } from "@/.source"

export const source = loader({
    baseUrl: "/",
    source: createMDXSource(docs, meta),
    icon(icon) {
        if (!icon) {
            // You may set a default icon
            return
        }

        if (icon == "NextMark") {
            return (
                <NextMark />
            )
        }

        if (icon in icons) return createElement(icons[icon as keyof typeof icons])
    },
})

export default function NextMark({ className }: { className?: string }) {
    return (
        <svg aria-label="Next.js logomark" className={className} color="black" height="80" role="img" viewBox="0 0 180 180" width="80">
            <mask height="180" id=":S3:mask0_408_134" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="180" x="0" y="0">
                <circle cx="90" cy="90" fill="black" r="90" />
            </mask>

            <g mask="url(#:S3:mask0_408_134)">
                <circle cx="90" cy="90" data-circle="true" fill="black" r="90" />
                <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#:S3:paint0_linear_408_134)" />
                <rect fill="url(#:S3:paint1_linear_408_134)" height="72" width="12" x="115" y="54" />
            </g>

            <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id=":S3:paint0_linear_408_134" x1="109" x2="144.5" y1="116.5" y2="160.5">
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>

                <linearGradient gradientUnits="userSpaceOnUse" id=":S3:paint1_linear_408_134" x1="121" x2="120.799" y1="54" y2="106.875">
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    )
}