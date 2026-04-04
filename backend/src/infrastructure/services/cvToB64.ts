import { fromBuffer } from "pdf2pic";
import { Result } from "../../domain/shared/types/Result.ts";
import { PdfToImageError } from "./errors/PdfToImage.error.ts";

export class cvToB64Service { 

    private detectFileType(filename: string): string {
        const parts = filename.split('.');

        if (parts.length > 2) {
            throw new Error('File must be in format "name.extension"')
        }

        const extension = parts[1].toLowerCase()
        const supportedFiles = ['pdf', 'jpg', 'png']

        if (!supportedFiles.includes(extension)) {
            throw new Error('Supported files are only pdf, jpg or png.')
            }
            
            return extension
        }

        async exec(buffer: Buffer, filename: string): Promise<Result<string, PdfToImageError>> {
        // Receive the CV
        const fileType = this.detectFileType(filename)
        let data;

        if (fileType == 'pdf') {
            data = await fromBuffer(buffer, {
                quality: 100,
                density: 300,
                preserveAspectRatio: true,
                format: 'png',
            }).bulk(-1, { responseType: 'base64' })

            const pages = data.map(page => page.base64)
            console.log(`Pages: ${pages.length}`)

            return { ok: true, value: pages.toString() }
        }

        // Convert to base64
        const b64Img: string = buffer.toString('base64')
        
        return { ok: true, value: b64Img }
    
    }
}

