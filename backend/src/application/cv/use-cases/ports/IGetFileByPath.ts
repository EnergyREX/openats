export interface IGetFileByPath {
    getFileByPath(path: string): Promise<Buffer>
}