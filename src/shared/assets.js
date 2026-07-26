/**
 * 素材地址解析（图床/CDN 支持）。
 * 站点配置 src/data/site.json 的 assetBase 为空时，素材从本站 public/ 加载；
 * 填入图床根地址（如 "https://img.example.com/agarchive"）后，
 * 所有相对路径素材自动改从图床加载 —— 数据文件无需改动。
 * 单条数据也可以直接填完整 URL，优先于 assetBase。
 */
import siteConfig from '../data/site.json'

const ASSET_BASE = String((siteConfig && siteConfig.assetBase) || '').trim()

export function assetUrl(path) {
  const p = String(path == null ? '' : path).trim()
  if (!p) return ''
  if (/^(https?:)?\/\//i.test(p) || p.startsWith('data:') || p.startsWith('blob:')) return p
  const rel = p.replace(/^\.?\//, '')
  return ASSET_BASE ? ASSET_BASE.replace(/\/+$/, '') + '/' + rel : './' + rel
}
