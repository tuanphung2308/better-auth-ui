"use client"

import type { ReactNode } from "react"

export default function SeparatorComponent({
    item
}: {
    item: { name: ReactNode; type: "separator"; icon?: ReactNode }
}) {
    return <div className="mt-3 mb-0.5 ml-5">{item.name}</div>
}
