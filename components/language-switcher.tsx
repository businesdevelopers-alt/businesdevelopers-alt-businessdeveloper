"use client"

import { useLanguage } from "@/lib/language-context"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-white/80 hover:text-white text-sm font-medium"
      aria-label={language === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      <Globe size={16} />
      <span>{language === "en" ? "العربية" : "English"}</span>
    </button>
  )
}
