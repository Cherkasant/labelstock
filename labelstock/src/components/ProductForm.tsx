'use client';

import { useState, FormEvent } from 'react';
import { Product } from '@/types';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (product: Product) => void;
  onCancel?: () => void;
}

export default function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [barcodeError, setBarcodeError] = useState('');

  const isEditing = !!initialData;

  const validateBarcode = (value: string): boolean => {
    // Code128 supports A-Z, a-z, 0-9, and some symbols
    const code128Regex = /^[A-Za-z0-9\s\-\.\+\*\/\%\$]+$/;
    return code128Regex.test(value);
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);
    if (value && !validateBarcode(value)) {
      setBarcodeError('Штрих-код должен содержать только буквы, цифры и некоторые символы (A-Z, 0-9, -, ., +, *, /, %, $)');
    } else {
      setBarcodeError('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (barcodeError) return; // Prevent submit if barcode invalid

    const productData = {
      name: name.trim(),
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity) || 0,
      barcode: barcode.trim() || undefined,
    };

    const product: Product = isEditing
      ? { ...initialData, ...productData } as Product
      : { ...productData, id: 0 } as Product;

    onSubmit(product);
    setName('');
    setPrice('');
    setQuantity('');
    setBarcode('');
    setBarcodeError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Название
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Цена (руб.)
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="0.01"
          min="0"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Количество
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
          Штрих-код (опционально, только A-Z, 0-9 и символы)
        </label>
        <input
          type="text"
          id="barcode"
          value={barcode}
          onChange={handleBarcodeChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${barcodeError ? 'border-red-500' : 'border-gray-300'}`}
        />
        {barcodeError && (
          <p className="mt-1 text-sm text-red-600">{barcodeError}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!!barcodeError}
          className={`flex-1 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${barcodeError ? 'bg-gray-400 cursor-not-allowed text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}`}
        >
          {isEditing ? 'Обновить' : 'Добавить'}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}