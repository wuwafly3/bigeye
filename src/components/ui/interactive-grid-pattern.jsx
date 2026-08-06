/* Magic UI InteractiveGridPattern（MIT，源自 magicuidesign/magicui registry/interactive-grid-pattern.tsx，改造）：
   原版每 rect 一个 onMouseEnter + React state（正文 z-1 层会拦截指针事件，且 ~756 rect 全量 diff）；
   改造为 window 级 passive mousemove + classList 受控高亮（is-lit），React 只负责渲染静态 SVG。 */
import React, { useEffect, useRef, useState } from "react"

import { cn } from "../../lib/utils"

export function InteractiveGridPattern({
  cellSize = 56,
  className,
  ...props
}) {
  const svgRef = useRef(null)
  const rectsRef = useRef([])
  const hoveredRef = useRef(-1)
  const [dims, setDims] = useState({ h: 0, v: 0 })

  /* 按视口计算格数（SVG 无 viewBox，必须真实尺寸避免 w-full 拉伸变形） */
  useEffect(() => {
    const compute = () => {
      const bounds = svgRef.current?.getBoundingClientRect()
      if (!bounds?.width || !bounds?.height) return
      setDims({
        h: Math.ceil(bounds.width / cellSize) + 1,
        v: Math.ceil(bounds.height / cellSize) + 1
      })
    }
    compute()
    const observer = new ResizeObserver(compute)
    if (svgRef.current) observer.observe(svgRef.current)
    return () => observer.disconnect()
  }, [cellSize])

  /* window 级鼠标追踪：O(1) 算格号，仅格号变化时切换 is-lit（paint-only，无 layout） */
  useEffect(() => {
    if (!dims.h) return
    hoveredRef.current = -1
    const lit = (i) => i >= 0 && i < rectsRef.current.length && rectsRef.current[i]
    const onLeave = () => {
      if (lit(hoveredRef.current)) rectsRef.current[hoveredRef.current].classList.remove("is-lit")
      hoveredRef.current = -1
    }
    const onMove = (e) => {
      const bounds = svgRef.current?.getBoundingClientRect()
      if (!bounds) return
      const x = e.clientX - bounds.left
      const y = e.clientY - bounds.top
      if (x < 0 || y < 0 || x >= bounds.width || y >= bounds.height) {
        onLeave()
        return
      }
      const i = Math.floor(x / cellSize) + Math.floor(y / cellSize) * dims.h
      if (i === hoveredRef.current) return
      if (lit(hoveredRef.current)) rectsRef.current[hoveredRef.current].classList.remove("is-lit")
      hoveredRef.current = i
      if (lit(i)) rectsRef.current[i].classList.add("is-lit")
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    document.documentElement.addEventListener("mouseleave", onLeave)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.documentElement.removeEventListener("mouseleave", onLeave)
    }
  }, [dims, cellSize])

  const total = dims.h * dims.v
  rectsRef.current = new Array(total)

  return (
    <svg ref={svgRef} className={cn("interactive-grid", className)} aria-hidden="true" {...props}>
      {Array.from({ length: total }).map((_, i) => (
        <rect
          key={i}
          data-i={i}
          ref={(el) => {
            rectsRef.current[i] = el
          }}
          x={(i % dims.h) * cellSize}
          y={Math.floor(i / dims.h) * cellSize}
          width={cellSize}
          height={cellSize}
        />
      ))}
    </svg>
  )
}
