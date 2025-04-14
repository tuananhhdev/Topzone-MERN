import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { ICustomer } from "../types/model.types";
import { model } from "mongoose";

const saltRounds = 10;

const customerSchema = new Schema(
  {
    avatar: {
      type: String,
      require: false,
    },
    first_name: {
      type: String,
      maxLength: 50,
      required: true,
    },
    last_name: {
      type: String,
      maxLength: 50,
      required: true,
    },
    phone: {
      type: String,
      maxLength: 50,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      maxLength: 150,
      required: true,
      unique: true,
    },
    street: {
      type: String,
      maxLength: 255,
    },
    city: {
      type: String,
      maxLength: 50,
    },
    state: {
      type: String,
      maxLength: 50,
    },

    password: {
      type: String,
      maxLength: 255,
      require: false,
      default: null,
    },
    /* Khóa tài khoản */
    active: {
      type: Boolean,
      default: true,
      require: false,
    },
    /* 
     Soft delete 
     Khi xóa sp thì đi update isDelete = true
     */
    isDelete: {
      type: Boolean,
      require: false,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

customerSchema.virtual("full_name").get(function () {
  return this.last_name + " " + this.first_name;
});

customerSchema.pre("save", async function (next) {
  const customer = this;
  if (customer.password) {
    const hash = bcrypt.hashSync(customer.password, saltRounds);
    customer.password = hash;
  }
  next();
});

const Customer = model<ICustomer>("Customer", customerSchema);
export default Customer;
