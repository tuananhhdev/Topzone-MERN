import { model, Schema } from "mongoose";
import { IBrand } from "../types/model.types";
import { buildSlug } from "../helpers/buildSlug";
import { required } from "joi";

const brandSchema = new Schema(
  {
    brand_name: {
      type: String,
      required: true,
      minLength: [1, "Brand name must be at least 1 characters!"],
      maxLength: 50,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      maxLength: 500,
      trim: true,
    },
    thumbnail: {
      type: String,
      require: false,
    },

    slug: {
      type: String,
      required: false,
      maxLength: 50,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    isShowHome: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

brandSchema.pre("save", function (next) {
  const brand = this;
  if (brand.brand_name) {
    brand.slug = buildSlug(brand.brand_name);
  }
  next();
});

const Brand = model<IBrand>("Brand", brandSchema);
export default Brand;
