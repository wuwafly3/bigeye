/* 首页阵营轨道挂载入口:magicui OrbitingCircles
   六个阵营图标绕 hero 系统环公转,点击跳转对应筛选的角色图鉴 */
import "../styles/magicui.css"
import { createRoot } from "react-dom/client"
import { OrbitingCircles } from "../components/ui/orbiting-circles"

const FACTIONS = [
  ["众星", "zhonxin"],
  ["圣树", "shengshu"],
  ["天垣", "tianyuan"],
  ["奥山", "aoshan"],
  ["尼罗", "niluo"],
  ["真樱", "zhenying"],
]

function FactionOrbit() {
  return (
    <OrbitingCircles radius={128} duration={40} iconSize={34}>
      {FACTIONS.map(([name, file]) => (
        <a
          key={file}
          className="ag-orbit-icon"
          href={`characters.html?faction=${encodeURIComponent(name)}`}
          title={name}
          aria-label={`${name}阵营角色`}
        >
          <img src={`images/game-art/factions/${file}.png`} alt="" draggable="false" />
        </a>
      ))}
    </OrbitingCircles>
  )
}

export function mountOrbit(el) {
  const root = createRoot(el)
  root.render(<FactionOrbit />)
}
