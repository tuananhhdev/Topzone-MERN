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
};

export interface ISpecification {
  battery: {
    capacity: string;
    charging: string;
  };
  camera: {
    main: string;
    selfie: string;
    [key: string]: string;
  };
  connectivity: {
    sim: string;
    network: string;
    wifi: string;
    bluetooth: string;
  };
  design: {
    dimensions: string;
    weight: string;
    material: string;
  };
  memory: {
    ram: string;
    storage: string;
  };
  operating_system: string;
  processor: {
    chip: string;
    gpu: string;
  };
  screen: {
    size: string;
    technology: string;
    resolution: string;
    refresh_rate: string;
  };
}