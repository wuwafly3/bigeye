import React from "react"

/**
 * Orbiting Circles — 沿圆形轨道公转的图标组。
 * 移植自 Magic UI (magicui.design),适配本项目设计令牌与无 tailwind 环境。
 *
 * Props:
 *  - radius        轨道半径(px)
 *  - duration      公转一周秒数
 *  - delay         起始延迟秒数
 *  - iconSize      图标容器边长(px)
 *  - reverse       反向旋转
 *  - path          是否显示轨道细环
 */
export function OrbitingCircles({
  className = "",
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 160,
  path = true,
  iconSize = 40,
}) {
  const items = React.Children.toArray(children)
  const count = items.length

  return (
    <div className={`ag-orbit ${className}`}>
      {path && (
        <svg className="ag-orbit-path" aria-hidden="true">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeDasharray="4 6"
          />
        </svg>
      )}
      {items.map((child, index) => {
        const angle = (360 / count) * index
        return (
          <div
            key={index}
            className="ag-orbit-item"
            style={{
              "--duration": `${duration}s`,
              "--delay": `${-delay - (duration / count) * index}s`,
              "--angle": `${angle}deg`,
              "--radius": `${radius}px`,
              "--icon-size": `${iconSize}px`,
              animationDirection: reverse ? "reverse" : "normal",
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}

export default OrbitingCircles
