import { Schema, model } from "mongoose";

// Định nghĩa schema cho technical specs
const specificationsSchema = new Schema(
  {
    // Thông tin cơ bản
    origin: { type: String, required: true }, // Xuất xứ
    release_date: { type: Date, required: true }, // Thời điểm ra mắt
    warranty: { type: Number, required: true }, // Thời gian bảo hành (tháng)

    // Thiết kế & Trọng lượng
    dimensions: { type: String, required: true }, // Kích thước
    weight: { type: Number, required: true }, // Trọng lượng sản phẩm
    water_resistance: { type: String, required: true }, // Chuẩn kháng nước / Bụi bẩn
    material: { type: String, required: true }, // Chất liệu

    // Bộ xử lý
    cpu_version: { type: String, required: true }, // Phiên bản CPU
    cpu_type: { type: String, required: true }, // Loại CPU
    cpu_cores: { type: Number, required: true }, // Số nhân CPU
    ram: { type: Number, required: true }, // RAM

    // Màn hình
    screen_size: { type: Number, required: true }, // Kích thước màn hình
    screen_type: { type: String, required: true }, // Công nghệ màn hình
    screen_resolution: { type: String, required: true }, // Độ phân giải màn hình
    glass_material: { type: String, required: true }, // Chất liệu mặt kính
    touch_type: { type: String, required: true }, // Loại cảm ứng
    brightness: { type: Number, required: true }, // Độ sáng tối đa
    contrast_ratio: { type: String, required: true }, // Độ tương phản

    // Đồ họa
    gpu: { type: String, required: true }, // Chip đồ hoạ (GPU)

    // Lưu trữ
    storage: { type: Number, required: true }, // Dung lượng lưu trữ
    expandable_memory: { type: Boolean, required: false, default: false }, // Thẻ nhớ ngoài (có hay không)

    // Camera
    rear_camera: {
      type: String,
      required: true,
    },
    video_quality: { type: [String], required: true }, // Quay phim camera sau

    selfie_camera: {
      resolution: { type: Number, required: true }, // Độ phân giải camera selfie
      video_quality: { type: [String], required: true }, // Quay phim camera selfie
    },

    // Cảm biến
    sensors: {
      type: [String],
      required: true,
    }, // Các cảm biến: ví dụ ["Cảm biến khí áp kế", "Con quay hồi chuyển", ...]

    // Bảo mật
    security: {
      password_unlock: { type: Boolean, default: false },
      face_unlock: { type: Boolean, default: false },
    },

    // Kết nối và giao tiếp
    sim: { type: Number, required: true }, // Số khe SIM
    connectivity: {
      type: Map,
      of: String,
      required: true,
    }, // Các kết nối khác: Wifi, Bluetooth, NFC, GPS, ...

    // Pin và sạc
    battery: {
      battery_type: { type: String, required: true },
      battery_life: { type: Number, required: true },
    }, // Loại pin và dung lượng pin
    more_infor: {
      fast_charging: { type: Boolean, default: false }, // Hỗ trợ sạc nhanh
      wireless_charging: { type: Boolean, default: false }, // Hỗ trợ sạc không dây
    },

    // Hệ điều hành
    os: { type: String, required: true }, // Hệ điều hành
    os_version: { type: String, required: true }, // Phiên bản hệ điều hành

    // Phụ kiện trong hộp
    accessories: {
      type: [String],
      required: true,
    }, // Các phụ kiện đi kèm (ví dụ: "Cáp USB-C", "Que lấy SIM", ...)
  },
  {
    timestamps: true, // Tự động lưu thời gian tạo và cập nhật
    // strictPopulate: false,
  }
);

const Specification = model("Specification", specificationsSchema);

export default Specification;
