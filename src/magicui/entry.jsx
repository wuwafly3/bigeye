/* Magic UI 实验挂载入口：把 React 组件渲染进现有原生页面（按需动态加载） */
import "../styles/magicui.css"
import { createRoot } from "react-dom/client"
import { ShimmerButton } from "../components/ui/shimmer-button"
import { BorderBeam } from "../components/ui/border-beam"

export function mount(el) {
  const root = createRoot(el)
  root.render(
    <div className="magic-stage__inner">
      <ShimmerButton className="magic-stage__btn">SYS_INIT // 进入档案</ShimmerButton>
      <div className="magic-stage__card">
        <span className="magic-stage__label">BORDER BEAM</span>
        <BorderBeam size={120} colorFrom="#f59e0b" colorTo="#334155" duration={8} />
      </div>
    </div>
  )
}
