import { Result } from "src/domain/shared/types/Result.ts";
import { PdfToImageError } from "src/infrastructure/services/errors/PdfToImage.error.ts";

export interface ICVToB64Service {
    exec(buffer: Buffer, filename: string): Promise<Result<string, PdfToImageError>>
}