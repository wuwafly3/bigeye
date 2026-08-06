import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/** 合并 class 的工具（magicui 组件依赖），等价于官方 @/lib/utils */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
