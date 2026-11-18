import mammoth from "mammoth";
import { fromBuffer } from "pdf2pic";
import { Ok, Result } from "../../domain/shared/types/Result.ts";
import { PdfToImageError } from "./errors/PdfToImage.error.ts";
import puppeteer from "puppeteer";
import { ICVToB64Service } from "src/application/cv/use-cases/ports/ICVToB64Service.ts";

export class cvToB64Service implements ICVToB64Service { 

    /**
     * Reads the file by its name and tells if its a supported file or not.
     * @param filename name of the file
     * @returns file extension
     */
    private detectFileType(filename: string): string {
        const parts = filename.split('.');
        
        const extension = parts[parts.length - 1].toLowerCase()
        const supportedFiles = ['pdf', 'docx', 'jpg', 'jpeg', 'png']

        if (!supportedFiles.includes(extension)) {
            throw new Error('Supported files are only pdf, jpg, jpeg or png.')
            }
            
            return extension
        }

    /**
     * Converts a buffer pdf to a Base64 image compatible with AI
     * @param buffer buffer object to be converted
     * @returns base64 images
     */
    private async pdfToBase64(buffer: Buffer) {
        const data = await fromBuffer(buffer, {
            quality: 100,
            density: 200,
            preserveAspectRatio: true,
            format: 'png',
        }).bulk(-1, { responseType: 'base64' })

        const pages = data.map(page => page.base64)
        console.log(`Pages: ${pages.length}`)
        return pages
    }

    /**
     * Main engine for cvToB64 service. Decides depending on the received file type
     * @param buffer buffer received from upstream
     * @param filename filename of the file
     * @returns base64 image for LLMs
     */
    async exec(buffer: Buffer, filename: string): Promise<Result<string, PdfToImageError>> {
        
        const fileType = this.detectFileType(filename)
        let data;

        // DOCX -> HTML -> PDF -> BASE64
        if (fileType == 'docx') {
            const browser = await puppeteer.launch();
            data = await mammoth.convertToHtml({ buffer: buffer })
            const page = await browser.newPage()
            await page.setContent(data.value)
            const pdf = await page.pdf({
                format: "A4",
                printBackground: true
            })

            await browser.close();

            const cv = await this.pdfToBase64(Buffer.from(pdf))

            return Ok(cv.toString())
        }

        // pdf -> base64
        if (fileType == 'pdf') {
            const pages = await this.pdfToBase64(buffer)
            return Ok(pages.toString())
        }

        // jpg, png -> base64
        const b64Img: string = buffer.toString('base64')
        return Ok(b64Img)   
    }
}

