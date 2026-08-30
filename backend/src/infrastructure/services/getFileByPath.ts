import fs from 'fs/promises'
import { IGetFileByPath } from 'src/application/cv/use-cases/ports/IGetFileByPath.ts';

export class getFileByPath implements IGetFileByPath {
    async getFileByPath(path: string): Promise<Buffer> {
        return await fs.readFile(path)
    }

}