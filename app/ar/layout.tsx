import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cliste - أتمتة الذكاء الاصطناعي للمؤسسات",
  description: "حول عملك باستخدام حلول أتمتة الذكاء الاصطناعي الذكية. تمكين مؤسستك من العمل بسرعة الفكر.",
}

export default function ArLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
