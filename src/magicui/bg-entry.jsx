/* 交互网格背景挂载入口（与实验区 entry.jsx 物理分离，删除实验区不误伤背景） */
import "../styles/magicui.css"
import { createRoot } from "react-dom/client"
import { InteractiveGridPattern } from "../components/ui/interactive-grid-pattern"

export function mountBackground(el) {
  const root = createRoot(el)
  root.render(<InteractiveGridPattern />)
}
