declare module 'pdfkit' {
  export default class PDFDocument {
    constructor(options?: any);
    pipe(stream: any): this;
    fontSize(size: number): this;
    text(text: string, x?: number, y?: number): this;
    moveDown(): this;
    end(): void;
    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
  }
}