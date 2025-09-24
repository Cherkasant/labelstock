'use client';

import { useState, useEffect } from 'react';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';
import LabelGenerator from '@/components/LabelGenerator';
import AuthForm from '@/components/AuthForm';
import { api, Product } from '@/utils/api';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Load products when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
      setSelectedIndices([]);
      setError(null);
    } catch (err: any) {
      if (err.message.includes('401')) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        return;
      }
      // Check if it's a network/connection error vs other errors
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Failed to load products. Please make sure the backend is running on port 3001.');
      } else {
        setError(`Failed to load products: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      let updatedProducts: Product[];
      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, productData as Partial<Omit<Product, 'id'>>);
        updatedProducts = products.map(p => p.id === editingProduct.id ? updated : p);
      } else {
        const newProduct = await api.createProduct(productData);
        updatedProducts = [...products, newProduct];
      }
      setProducts(updatedProducts);
      setEditingProduct(null);
      await loadProducts();
    } catch (err: any) {
      if (err.message.includes('401')) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        return;
      }
      setError(`Failed to save product: ${err.message}`);
    }
  };

  const handleEditProduct = (index: number) => {
    setEditingProduct(products[index]);
  };

  const handleDeleteProduct = (index: number) => {
    setDeletingProduct(products[index]);
  };

  const handleConfirmDelete = async () => {
    if (deletingProduct) {
      try {
        await api.deleteProduct(deletingProduct.id);
        setProducts(products.filter(p => p.id !== deletingProduct.id));
        setSelectedIndices(prev => prev.filter(i => products[i]?.id !== deletingProduct.id));
        await loadProducts();
      } catch (err: any) {
        if (err.message.includes('401')) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          return;
        }
        setError(`Failed to delete product: ${err.message}`);
      }
    }
    setDeletingProduct(null);
  };

  const handleCancelDelete = () => {
    setDeletingProduct(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSelectChange = (indices: number[]) => {
    setSelectedIndices(indices);
  };

  const selectedProducts = selectedIndices.map(i => products[i]);

  const handleGeneratePdf = async (productIds: number[], includeQrCodes: boolean) => {
    try {
      await api.generatePdf(productIds, includeQrCodes);
    } catch (err: any) {
      if (err.message.includes('401')) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        return;
      }
      setError(`Failed to generate PDF: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
        <button onClick={loadProducts} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              LabelStock | Склад и этикетки для вашего магазина
            </h1>
            <p className="text-xl text-gray-600 italic">
              Простой контроль склада и профессиональная печать этикеток в пару кликов.
            </p>
          </header>

          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
            >
              Выйти
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
              </h2>
              <ProductForm
                initialData={editingProduct || null}
                onSubmit={handleAddOrUpdateProduct}
                onCancel={handleCancelEdit}
              />
            </section>

            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Список товаров</h2>
              <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onSelectChange={handleSelectChange}
              />
            </section>
          </div>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Генерация этикеток</h2>
            <LabelGenerator
              selectedProducts={selectedProducts}
              onPrint={handleGeneratePdf}
            />
          </section>
        </div>

        <style jsx global>{`
          @media print {
            .no-print {
              display: none !important;
            }
            .label {
              page-break-inside: avoid;
              margin: 10px;
              box-shadow: none;
              border: 1px solid #000;
            }
            body {
              background: white !important;
            }
            .container {
              max-width: none;
            }
          }
        `}</style>
      </main>

      {/* Edit Modal */}
      {editingProduct && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Редактировать товар</h3>
                <ProductForm
                  initialData={editingProduct}
                  onSubmit={handleAddOrUpdateProduct}
                  onCancel={handleCancelEdit}
                />
              </div>
              <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
              <div className="p-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Удалить товар?</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Вы уверены, что хотите удалить <span className="font-medium text-gray-900">{deletingProduct.name}</span>? Это действие нельзя отменить.
                </p>
              </div>
              <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg space-x-2">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
