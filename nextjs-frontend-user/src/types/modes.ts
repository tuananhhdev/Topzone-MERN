export type TProduct = {
  _id?: string;
  product_name: string;
  price: number;
  price_end: number;
  discount: number;
  category: string;
  brand: string;
  description: string;
  thumbnail: string;
  stock: number;
  slug: string;
  order: number;
  specifications: string;
};

export type TCustomer = {
  _id: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
}