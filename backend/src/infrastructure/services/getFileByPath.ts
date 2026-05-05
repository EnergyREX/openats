import fs from 'fs/promises'
export async function getFileByPath(path: string) {
    return await fs.readFile(path)
}