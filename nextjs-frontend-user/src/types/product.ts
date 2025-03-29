export interface IProductVariant {
  storage: string;
  price: number;
  stock: number;
}

export interface IProductSpecification {
  operating_system?: string;
  screen?: {
    size: string;
    technology: string;
    resolution: string;
    refresh_rate: string;
  };
  processor?: {
    chip: string;
    gpu: string;
  };
  memory?: {
    ram: string;
    storage: string;
  };
  camera?: {
    main: string;
    selfie: string;
    features: string[];
  };
  battery?: {
    capacity: string;
    charging: string;
  };
  connectivity?: {
    sim: string;
    network: string;
    wifi: string;
    bluetooth: string;
  };
  design?: {
    dimensions: string;
    weight: string;
    material: string;
  };
}

export type TProduct = {
  _id: string;
  product_name: string;
  price: number;
  discount: number;
  discount_end_time?: Date;
  price_end: number;
  category: {
    _id: string;
    category_name: string;
  };
  brand: {
    _id: string;
    brand_name: string;
  };
  description: string;
  photos: string[];
  stock: number;
  slug: string;
  order: number;
  variants?: IProductVariant[];
  isBest: boolean;
  isRecentlyAdded: boolean;
  isShowHome: boolean;
  isDelete: boolean;
  specification: IProductSpecification;
}; 