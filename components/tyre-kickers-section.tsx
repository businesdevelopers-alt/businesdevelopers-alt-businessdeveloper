"use client"
import { useEffect, useRef } from "react"
import { useLanguage } from "@/lib/language-context"

export function TyreKickersSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { t, isRTL } = useLanguage()

  const benefits = [
    {
      title: t.dealership?.benefits?.instantAnswers || "Instant Answers",
      description:
        t.dealership?.benefits?.instantAnswersDesc ||
        "Clutch responds to 50+ common questions about NCT, mileage, trade-ins, and pricing instantly",
    },
    {
      title: t.dealership?.benefits?.qualifyLeads || "Qualify Leads",
      description:
        t.dealership?.benefits?.qualifyLeadsDesc ||
        "Automatically filters serious buyers from browsers by asking the right questions",
    },
    {
      title: t.dealership?.benefits?.saveTime || "Save Time",
      description:
        t.dealership?.benefits?.saveTimeDesc || "Stop answering the same questions repeatedly - let Clutch handle it",
    },
    {
      title: t.dealership?.benefits?.availability24 || "24/7 Availability",
      description:
        t.dealership?.benefits?.availability24Desc ||
        "Never miss a serious inquiry while filtering out time-wasters around the clock",
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll(".fade-in-element")
            elements.forEach((element, index) => {
              setTimeout(() => {
                element.classList.add("animate-fade-in-up")
              }, index * 100)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`py-16 md:py-24 relative z-10 px-4 sm:px-6 lg:px-8 ${isRTL ? "text-right" : "text-left"}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance fade-in-element">
            {t.dealership?.benefits?.title || "Clutch By Cliste for Dealerships"}
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto fade-in-element">
            {t.dealership?.benefits?.subtitle || "Handle More Leads, Close More Sales"}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 fade-in-element ${isRTL ? "text-right" : "text-left"}`}
            >
              <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
              <p className="text-slate-300 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
