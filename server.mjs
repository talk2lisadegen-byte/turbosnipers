import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getTopTraders } from './server/birdeye.mjs'

const root = fileURLToPath(new URL('.', import.meta.url))
const dist = resolve(root, 'dist')

function readLocalApiKey() {
  if (process.env.BIRDEYE_API_KEY) return process.env.BIRDEYE_API_KEY
  const envFile = resolve(root, '.env')
  if (!existsSync(envFile)) return ''
  const line = readFileSync(envFile, 'utf8').split(/\r?\n/).find((entry) => /^\s*BIRDEYE_API_KEY\s*=/.test(entry))
  if (!line) return ''
  return line.replace(/^\s*BIRDEYE_API_KEY\s*=\s*/, '').trim().replace(/^(["'])(.*)\1$/, '$2')
}

const apiKey = readLocalApiKey()
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', 'http://localhost')
  if (requestUrl.pathname === '/api/top-traders') {
    if (request.method !== 'GET') {
      response.writeHead(405, { 'content-type': 'application/json; charset=utf-8' })
      response.end(JSON.stringify({ message: 'Method not allowed' }))
      return
    }
    try {
      const result = await getTopTraders(request.url ?? '/api/top-traders', apiKey)
      response.writeHead(result.status, Object.fromEntries(result.headers.entries()))
      response.end(await result.text())
    } catch {
      response.writeHead(502, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      response.end(JSON.stringify({ configured: Boolean(apiKey), message: 'Trader data is temporarily unavailable.', items: [] }))
    }
    return
  }

  if (!existsSync(dist)) {
    response.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Build the site before starting the production server.')
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(requestUrl.pathname)
  } catch {
    response.writeHead(400)
    response.end('Bad request')
    return
  }
  let filePath = resolve(dist, `.${pathname}`)
  if (!filePath.startsWith(`${dist}${sep}`) && filePath !== dist) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = resolve(filePath, 'index.html')
  if (!existsSync(filePath) || !statSync(filePath).isFile()) filePath = resolve(dist, 'index.html')
  response.writeHead(200, {
    'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
    'cache-control': filePath.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  createReadStream(filePath).pipe(response)
})

const port = Number(process.env.PORT ?? 4173)
server.listen(port, '0.0.0.0', () => console.log(`Turbo Sniper Pro server listening on http://localhost:${port}`))
