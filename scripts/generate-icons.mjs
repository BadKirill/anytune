// One-off icon generator: renders public/icon.svg into the PNG sizes the
// manifest and iOS need. Run with: node scripts/generate-icons.mjs
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

const svg = await readFile(new URL('../public/icon.svg', import.meta.url))

const outputs = [
  { file: 'public/pwa-192x192.png', size: 192 },
  { file: 'public/pwa-512x512.png', size: 512 },
  { file: 'public/maskable-512x512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
]

for (const { file, size } of outputs) {
  await sharp(svg).resize(size, size).png().toFile(file)
  console.log(`wrote ${file}`)
}
