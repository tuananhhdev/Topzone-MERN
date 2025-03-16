import { model, Schema } from "mongoose";
import { ICategory } from "../types/model.types";
import { buildSlug } from "../helpers/buildSlug";

const categorySchema = new Schema(
  {
    category_name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      maxLength: 500,
      required: false,
    },
    photos: {
      type: [String],
      required: false,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
      maxLength: 50,
      trim: true,
    },
    order: {
      type: Number,
      default: 50, // giá trị mặc định khi không điền
      min: 1, // giá trị tối thiểu chấp nhận
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre("save", function (next) {
  const category = this;
  if (category.category_name) {
    category.slug = buildSlug(category.category_name);
  }
  next();
});

const Category = model<ICategory>("Category", categorySchema);
export default Category;
