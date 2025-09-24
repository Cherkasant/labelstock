'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { api } from '@/utils/api';

interface LabelGeneratorProps {
  selectedProducts: Product[];
  onPrint: (productIds: number[], includeQrCodes: boolean) => Promise<void>;
}

export default function LabelGenerator({ selectedProducts, onPrint }: LabelGeneratorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [JsBarcode, setJsBarcode] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    import('jsbarcode').then((module) => {
      setJsBarcode(() => module.default);
    });
  }, []);

  const [includeQrCodes, setIncludeQrCodes] = useState(false);

  const handleGeneratePdf = async () => {
    const productIds = selectedProducts.map(p => p.id);
    await onPrint(productIds, includeQrCodes);
  };

  useEffect(() => {
    if (!isMounted || !JsBarcode) return;

    selectedProducts.forEach((product) => {
      if (product && product.barcode) {
        const element = document.getElementById(`barcode-${product.id}`);
        if (element) {
          JsBarcode(element, product.barcode, {
            format: 'CODE128',
            displayValue: false,
            width: 2,
            height: 40,
            margin: 0,
          });
        }
      }
    });
  }, [selectedProducts, isMounted, JsBarcode]);

  if (selectedProducts.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">Выберите товары для генерации этикеток</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Этикетки для печати ({selectedProducts.length})</h3>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeQrCodes}
              onChange={(e) => setIncludeQrCodes(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Включить QR-коды</span>
          </label>
          <button
            onClick={handleGeneratePdf}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Скачать PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedProducts.map((product, index) => (
          <div
            key={product.id || index}
            className="label p-4 border-2 border-blue-200 rounded-lg bg-white shadow-sm print:border-black print:shadow-none min-h-[200px]"
          >
            <h4 className="text-base font-semibold text-blue-600 mb-2 print:text-black print:font-bold">
              {product.name}
            </h4>
            <p className="text-sm text-gray-700 mb-1 print:text-black">
              Цена: <span className="font-medium">{product.price} руб.</span>
            </p>
            {product.quantity > 0 && (
              <p className="text-sm text-gray-700 mb-1 print:text-black">
                Кол-во: <span className="font-medium">{product.quantity}</span>
              </p>
            )}
            {product.barcode && isMounted && (
              <>
                <p className="text-sm text-gray-700 print:text-black mb-2">
                  Штрих-код: <span className="font-mono">{product.barcode}</span>
                </p>
                <div className="mb-2 print:mb-1">
                  <svg id={`barcode-${product.id}`}></svg>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}