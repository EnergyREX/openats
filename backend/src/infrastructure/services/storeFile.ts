import { randomUUID } from 'node:crypto'
import fs from 'fs/promises'
import path from 'node:path'

export async function storeFile(file: Buffer, filename: string) {
    const baseRoute = `${process.cwd()}/src/infrastructure/storage`
    await fs.mkdir(baseRoute, { recursive: true })

    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_')
    const finalName = /[a-zA-Z0-9]/.test(safeName) ? safeName : `${randomUUID()}.bin`

    const filePath = path.join(baseRoute, `${Date.now()}-${finalName}`)

    await fs.writeFile(filePath, file)

    return filePath
}
