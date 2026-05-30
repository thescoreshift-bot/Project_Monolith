/**
 * Build production output and zip dist/ for itch.io HTML upload.
 * Output: project-monolith-itch.zip (index.html at zip root)
 */
import { execSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const zipName = 'project-monolith-itch.zip'
const zipPath = join(root, zipName)

if (!existsSync(distDir)) {
  console.error('Missing dist/ — run npm run build first.')
  process.exit(1)
}

if (existsSync(zipPath)) {
  rmSync(zipPath, { force: true })
}

const isWin = process.platform === 'win32'

if (isWin) {
  const distEscaped = distDir.replace(/'/g, "''")
  const zipEscaped = zipPath.replace(/'/g, "''")
  execSync(
    `powershell -NoProfile -Command "Set-Location -LiteralPath '${distEscaped}'; Compress-Archive -Path * -DestinationPath '${zipEscaped}' -Force"`,
    { stdio: 'inherit' },
  )
} else {
  execSync(`zip -r "${zipPath}" .`, { cwd: distDir, stdio: 'inherit' })
}

console.log('')
console.log(`itch.io upload ready: ${zipName}`)
console.log('Upload this zip on itch → Edit game → Uploads → HTML (play in browser).')
console.log('Embed size: 1280 × 720, enable Fullscreen button.')
