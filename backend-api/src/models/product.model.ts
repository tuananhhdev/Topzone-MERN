import mongoose, { Schema, Document } from "mongoose";

export interface IProductVariant {
  storage: string;
  price: number;
  stock: number;
}

export interface IProduct extends Document {
  product_name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  photos: string[];
  category: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  variants: IProductVariant[];
  specification: {
    screen: {
      size: string;
      technology: string;
      resolution: string;
      refresh_rate: string;
    };
    processor: {
      chip: string;
      gpu: string;
    };
    memory: {
      ram: string;
      storage: string[];
    };
    camera: {
      main: string;
      selfie: string;
      features: string[];
    };
    battery: {
      capacity: string;
      charging: string;
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
  };
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

const productSchema = new Schema<IProduct>(
  {
    product_name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    photos: [{ type: String, required: true }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    variants: [{
      storage: { type: String, required: true },
      price: { type: Number, required: true },
      stock: { type: Number, required: true }
    }],
    specification: {
      screen: {
        size: String,
        technology: String,
        resolution: String,
        refresh_rate: String
      },
      processor: {
        chip: String,
        gpu: String
      },
      memory: {
        ram: String,
        storage: [String]
      },
      camera: {
        main: String,
        selfie: String,
        features: [String]
      },
      battery: {
        capacity: String,
        charging: String
      },
      connectivity: {
        sim: String,
        network: String,
        wifi: String,
        bluetooth: String
      },
      design: {
        dimensions: String,
        weight: String,
        material: String
      }
    },
    is_featured: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model<IProduct>("Product", productSchema); 