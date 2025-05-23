import { model, Schema } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { buildSlug } from "../helpers/buildSlug";
import { IProduct } from "../types/model.types";
import { required } from "joi";

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
      maxLength: 255,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
      max: 100000000,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100000000,
      default: 0,
    },
    discount_end_time: {
      type: Date,
      required: false,
    },
    price_end: {
      type: Number,
      min: 0,
      default: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    description: {
      type: String,
      require: false, //mặc định true, nếu bạn ko liệt kê vào
    },
    photos: {
      type: [String],
      require: false,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      require: false,
    },
    slug: {
      type: String,
      required: false,
      maxLength: 255,
      unique: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 50,
      min: 1,
      required: false,
    },
    variants: [
      {
        storage: {
          type: String,
          required: true,
        },
        product_name: { type: String },
        colors: [
          {
            color: {
              type: String,
              required: true,
            },
            price: {
              type: Number,
              required: true,
              min: 0,
            },
            stock: {
              type: Number,
              required: true,
              min: 0,
              default: 0,
            },
            variantImage: {
              type: [String],
              required: false,
            },
          },
        ],
      },
    ],
    isBest: {
      type: Boolean,
      require: false,
      default: false,
    },
    isRecentlyAdded: {
      type: Boolean,
      require: false,
      default: false,
    },
    isShowHome: {
      type: Boolean,
      require: false,
      default: false,
    },
    isDelete: {
      type: Boolean,
      require: false,
      default: false,
    },
    specification: {
      operating_system: {
        type: String,
        enum: ["iOS", "Android", "HarmonyOS", "Windows", "macOS"],
        required: false,
      },
      screen: {
        size: String,
        technology: String,
        resolution: String,
        refresh_rate: String,
      },
      processor: {
        chip: String,
        gpu: String,
      },
      memory: {
        ram: String,
        storage: String,
      },
      camera: {
        main: String,
        selfie: String,
        features: [String],
      },
      battery: {
        capacity: String,
        charging: String,
      },
      connectivity: {
        sim: String,
        network: String,
        wifi: String,
        bluetooth: String,
      },
      design: {
        dimensions: String,
        weight: String,
        material: String,
      },
    },
    youtubeVideos: [
      {
        youtubeID: { type: String, required: true },
        youtubeTitle: { type: String, required: true },
      },
    ],
    
    
  },
  {
    timestamps: true,
    // strictPopulate: false,
  }
);

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });
productSchema.plugin(mongooseLeanVirtuals);

productSchema.pre("save", function (next) {
  const product = this;
  if (product.product_name && product.slug == undefined) {
    product.slug = buildSlug(product.product_name);
  }
  if (product.discount && product.discount > 0) {
    product.price_end =
      product.price - (product.price * product.discount) / 100;
  } else {
    product.price_end = product.price;
  }
  next();
});

const Product = model<IProduct>("Product", productSchema);
export default Product;
