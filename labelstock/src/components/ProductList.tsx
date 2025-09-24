'use client';

import { useState } from 'react';
import { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onSelectChange?: (selectedIndices: number[]) => void;
}

export default function ProductList({ 
  products, 
  onEdit, 
  onDelete, 
  onSelectChange 
}: ProductListProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    let newSelected: number[];
    if (checked) {
      newSelected = [...selectedIndices, index];
    } else {
      newSelected = selectedIndices.filter(i => i !== index);
    }
    setSelectedIndices(newSelected);
    onSelectChange?.(newSelected);
  };

  return (
    <ul className="space-y-3">
      {products.map((product, index) => (
        <li 
          key={index} 
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
        >
          <div className="flex items-center flex-1 gap-3">
            <input
              type="checkbox"
              checked={selectedIndices.includes(index)}
              onChange={(e) => handleCheckboxChange(index, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-sm text-gray-500">
                Цена: {product.price} руб. • Кол-во: {product.quantity}
                {product.barcode && ` • Штрих-код: ${product.barcode}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(index)}
              className="px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-100 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              Редактировать
            </button>
            <button
              onClick={() => onDelete(index)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Удалить
            </button>
          </div>
        </li>
      ))}
      {products.length === 0 && (
        <li className="p-4 text-center text-gray-500">
          Нет товаров. Добавьте первый товар.
        </li>
      )}
    </ul>
  );
}