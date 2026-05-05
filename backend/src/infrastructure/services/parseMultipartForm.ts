import { FastifyRequest } from 'fastify';

type BufferedFile = {
  filename: string;
  toBuffer: () => Promise<Buffer>;
};

export async function parseMultipartForm(req: FastifyRequest) {
  const fields: Record<string, string> = {};
  let file: BufferedFile | undefined;

  for await (const part of req.parts()) {
    if (part.type === 'file') {
      const buffer = await part.toBuffer();
      file = {
        filename: part.filename,
        toBuffer: async () => buffer,
      };
    } else {
      fields[part.fieldname] = part.value as string;
    }
  }

  return { fields, file };
}