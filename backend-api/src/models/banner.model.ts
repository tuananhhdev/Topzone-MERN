import { model, Schema } from "mongoose";

const bannerSchema = new Schema({
  imageUrl: { type: String, required: true }, // Đường dẫn URL của hình ảnh banner (bắt buộc)
  altText: { type: String, required: true }, // Văn bản thay thế cho hình ảnh (bắt buộc)
  link: { type: String }, // Đường dẫn liên kết khi nhấp vào banner (tùy chọn)
});

const Banner = model("Banner", bannerSchema);

export default Banner
