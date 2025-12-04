"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"

const ArrowRight = () => (
  <svg
    className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const ArrowLeft = () => (
  <svg
    className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

export function DealershipHeroHeader() {
  const [counter, setCounter] = useState(0)
  const targetValue = 200
  const { t, isRTL } = useLanguage()
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = targetValue / steps
    const stepDuration = duration / steps

    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep <= steps) {
        setCounter(Math.min(Math.round(increment * currentStep), targetValue))
      } else {
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-8">
      <h1
        className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-balance animate-fade-in-heading ${isRTL ? "text-right" : ""}`}
      >
        {t.dealership?.hero?.title || "Never Miss Another Lead"}
      </h1>

      <div className="animate-fade-in-subheading">
        {/* Mobile version - stacked */}
        <div className={`flex flex-col items-center gap-2 sm:hidden ${isRTL ? "text-right" : ""}`}>
          <span className="text-lg text-slate-300">{t.dealership?.hero?.subtitle || "Irish dealerships lose"}</span>
          <span className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent animate-pulse-glow">
            {t.dealership?.hero?.subtitleValue || "€200K+"}
          </span>
          <span className="text-lg text-slate-300">{t.dealership?.hero?.subtitleEnd || "annually"}</span>
        </div>

        {/* Desktop version - single line */}
        <div
          className={`hidden sm:flex items-center justify-center gap-2 sm:gap-3 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-xl md:text-2xl text-slate-300">
            {t.dealership?.hero?.subtitle || "Irish dealerships lose"}
          </span>
          <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent animate-pulse-glow">
            {t.dealership?.hero?.subtitleValue || "€200K+"}
          </span>
          <span className="text-xl md:text-2xl text-slate-300">{t.dealership?.hero?.subtitleEnd || "annually"}</span>
        </div>
      </div>

      {/* Video placeholder */}
      <div className="max-w-xs sm:max-w-3xl mx-auto px-6 sm:px-0 mb-8 animate-fade-in-buttons">
        <div className="relative w-full aspect-video bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl group cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all duration-300 shadow-xl">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-2 mt-24 sm:mt-32">
              <p className="text-white/70 text-xs sm:text-base font-medium">Demo Video Coming Soon</p>
            </div>
          </div>

          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
      </div>

      {/* Buttons */}
      <div
        className={`max-w-xs sm:max-w-3xl mx-auto px-6 sm:px-0 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-buttons ${isRTL ? "sm:flex-row-reverse" : ""}`}
      >
        <Button
          size="lg"
          className={`bg-white text-black rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-lg group cursor-pointer relative overflow-hidden w-full sm:w-auto ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {t.dealership?.hero?.bookDemo || "Book Demo"}
          {isRTL ? <ArrowLeft /> : <ArrowRight />}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="bg-transparent text-white border-2 border-white/30 rounded-full px-8 py-4 text-lg font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-105 hover:shadow-lg cursor-pointer backdrop-blur-sm w-full sm:w-auto"
        >
          {t.dealership?.hero?.enquireNow || "Enquire Now"}
        </Button>
      </div>
    </div>
  )
}
