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

export interface TProduct {
  _id: string;
  product_name: string;
  slug: string;
  photos: string[];
  price: number;
  price_end?: number;
  discount: number;
  stock: number;
  order: number;
  variants?: IProductVariant[];
  category: {
    _id: string;
    category_name: string;
    slug: string;
  };
  brand: {
    _id: string;
    brand_name: string;
    slug: string;
  };
  description: string;
  specification: IProductSpecification;
  isActive?: boolean;
  isBest?: boolean;
  isRecentlyAdded?: boolean;
  isDelete?: boolean;
  isShowHome?: boolean;
} 