const API_BASE = 'http://localhost:3001';
const PRODUCTS_BASE = `${API_BASE}/products`;

let token: string | null = null;

export const setToken = (newToken: string) => {
  token = newToken;
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', newToken);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined' && !token) {
    token = localStorage.getItem('token');
  }
  return token;
};

export const removeToken = () => {
  token = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
}

export const api = {
  async login(username: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    setToken(data.access_token);
    return data.access_token;
  },

  async register(username: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Registration failed');
    const data = await response.json();
    setToken(data.access_token);
    return data.access_token;
  },

  async getProducts(): Promise<Product[]> {
    const response = await fetch(PRODUCTS_BASE, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    return response.json();
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await fetch(PRODUCTS_BASE, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
    return response.json();
  },

  async updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const response = await fetch(`${PRODUCTS_BASE}/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
    return response.json();
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${PRODUCTS_BASE}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
  },

  async generatePdf(productIds: number[], includeQrCodes: boolean = false): Promise<void> {
    const response = await fetch(`${PRODUCTS_BASE}/generate-pdf`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productIds, includeQrCodes }),
    });
    if (!response.ok) throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = includeQrCodes ? 'labels-with-qr.pdf' : 'labels.pdf';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};