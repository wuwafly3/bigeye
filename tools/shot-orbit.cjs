/* 临时截图脚本:验证首页阵营轨道图标渲染 */
const { chromium } = require('playwright-core')

async function main() {
  const exe = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  const browser = await chromium.launch({ executablePath: exe, headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  const state = await page.evaluate(() => {
    const orbit = document.querySelector('.hero-faction-orbit')
    const items = orbit ? orbit.querySelectorAll('.ag-orbit-item').length : 0
    const icons = orbit ? orbit.querySelectorAll('.ag-orbit-icon img').length : 0
    const broken = orbit
      ? [...orbit.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).length
      : -1
    return { mounted: !!orbit, items, icons, broken }
  })
  console.log('orbit state:', JSON.stringify(state))

  // hero 区域截图
  const hero = await page.$('.home-hero')
  await hero.screenshot({ path: 'screenshots/orbit-check-light.png' })

  // 暗色主题
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark'
  })
  await page.waitForTimeout(400)
  await hero.screenshot({ path: 'screenshots/orbit-check-dark.png' })

  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
