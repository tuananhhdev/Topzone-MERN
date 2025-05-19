import { model, Schema } from "mongoose";

interface IOTP extends Document {
  email: string;
  otp: string;
  expires: number;
  createdAt: Date;
}

const otpSchema: Schema<IOTP> = new Schema({
  email: {
    type: String,
    required: [true, "Email là bắt buộc"],
  },
  otp: {
    type: String,
    required: true,
  },
  expires: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Tự động xóa sau 5 phút
  },
});

const OTP = model<IOTP>("OTP", otpSchema);
export default OTP;