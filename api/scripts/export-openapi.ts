import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { app, openApiDocumentConfig } from '../src/app.js'

const outputPath = resolve(process.cwd(), 'openapi.json')
const document = app.getOpenAPIDocument(openApiDocumentConfig)

await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`)
console.log(`OpenAPI schema written to ${outputPath}`)
