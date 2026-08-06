/* Magic UI MagicCard（MIT，源自 magicuidesign/magicui 核心逻辑，支持直角/微圆角长方形） */
import React, { useCallback, useEffect, useRef } from "react"
import { cn } from "../../lib/utils"

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "rgba(148, 163, 184, 0.15)",
  gradientOpacity = 0.8,
  gradientFrom = "#f59e0b",
  gradientTo = "#334155",
}) {
  const cardRef = useRef(null)

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      cardRef.current.style.setProperty("--mouse-x", `${x}px`)
      cardRef.current.style.setProperty("--mouse-y", `${y}px`)
    },
    []
  )

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    el.addEventListener("mousemove", handleMouseMove)
    return () => el.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  return (
    <div
      ref={cardRef}
      className={cn(
        "magic-card group relative flex flex-col overflow-hidden rounded-md border border-slate-700/30 bg-slate-900/60 p-4 transition-all duration-300 hover:border-slate-500/50",
        className
      )}
      style={{
        "--gradient-size": `${gradientSize}px`,
        "--gradient-color": gradientColor,
        "--gradient-opacity": gradientOpacity,
        "--gradient-from": gradientFrom,
        "--gradient-to": gradientTo,
      }}
    >
      {/* 动态跟随光斑层 */}
      <div
        className="pointer-events-none absolute -inset-px rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(var(--gradient-size) circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--gradient-color), transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}
