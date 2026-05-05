import fs from 'fs/promises'

export async function storeFile(file: Buffer, filename: string) {
    const baseRoute = `${process.cwd()}/src/infrastructure/storage`
    await fs.mkdir(baseRoute, { recursive: true })

    const path = `${baseRoute}/${Date.now()}-${filename}`

    await fs.writeFile(path, file)
    
    return path
}