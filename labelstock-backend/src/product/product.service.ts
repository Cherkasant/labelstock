import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import bwipjs from 'bwip-js';
import * as QRCode from 'qrcode';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private async generateBarcode(barcodeText: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      bwipjs.toBuffer({
        bcid: 'code128',
        text: barcodeText,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      }, (err, png) => {
        if (err) {
          reject(err);
        } else {
          resolve(png);
        }
      });
    });
  }

  private async generateQrCode(text: string): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(text, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  async generateLabelsPdf(productIds: number[], includeQrCodes: boolean = false): Promise<Buffer> {
    console.log('Generating PDF for productIds:', productIds, 'includeQrCodes:', includeQrCodes);
    const products = await Promise.all(
      productIds.map(id => this.findOne(id)),
    );
    console.log('Products found:', products.map(p => ({ id: p.id, barcode: p.barcode })));

    const barcodePromises = products.map(async (product) => {
      if (!product.barcode) return null;
      try {
        return await this.generateBarcode(product.barcode);
      } catch (error) {
        console.error('Barcode generation error for product', product.id, ':', error);
        return null;
      }
    });

    const qrCodePromises = products.map(async (product) => {
      if (!includeQrCodes) return null;
      try {
        const qrText = `Product: ${product.name}\nPrice: ${product.price} руб.\nQuantity: ${product.quantity}\nBarcode: ${product.barcode || 'N/A'}`;
        return await this.generateQrCode(qrText);
      } catch (error) {
        console.error('QR code generation error for product', product.id, ':', error);
        return null;
      }
    });

    const [barcodeBuffers, qrCodeBuffers] = await Promise.all([
      Promise.all(barcodePromises),
      Promise.all(qrCodePromises)
    ]);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 20 });
        const chunks: Buffer[] = [];

        const fontPath = path.join(__dirname, '../../fonts/Roboto-Regular.ttf');
        doc.registerFont('Roboto', fontPath);
        doc.font('Roboto');

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        products.forEach((product, index) => {
          if (index > 0) {
            doc.addPage();
          }
          let y = 50;
          doc.fontSize(16).font('Roboto').text(product.name, 50, y);
          y += 20;
          doc.fontSize(12).font('Roboto').text(`Цена: ${product.price} руб.`, 50, y);
          y += 15;
          doc.fontSize(12).font('Roboto').text(`Количество: ${product.quantity}`, 50, y);
          y += 15;
          
          const barcodeBuffer = barcodeBuffers[index];
          const qrCodeBuffer = qrCodeBuffers[index];
          
          if (product.barcode) {
            doc.fontSize(12).font('Roboto').text(`Штрих-код: ${product.barcode}`, 50, y);
            y += 15;
            if (barcodeBuffer) {
              doc.image(barcodeBuffer, 50, y, { width: 200, height: 40 });
              y += 50;
            } else {
              doc.fontSize(10).font('Roboto').text('Ошибка генерации штрих-кода', 50, y);
              y += 20;
            }
          }

          if (includeQrCodes) {
            doc.fontSize(12).font('Roboto').text('QR код:', 50, y);
            y += 15;
            if (qrCodeBuffer) {
              doc.image(qrCodeBuffer, 50, y, { width: 100, height: 100 });
              y += 110;
            } else {
              doc.fontSize(10).font('Roboto').text('Ошибка генерации QR кода', 50, y);
              y += 20;
            }
          }
        });

        doc.end();
      } catch (error) {
        console.error('PDF generation error:', error);
        reject(error);
      }
    });
  }
}