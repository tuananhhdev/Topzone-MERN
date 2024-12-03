import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt'
import { IStaff } from '../types/model.types';

const saltRounds = 10;
const staffSchema = new Schema({
  avatar : {
    type: String,
    require: false,
  },
  first_name: {
    type: String,
    required: true,
    maxLength: 50
  },
  last_name: {
    type: String,
    required: true,
    maxLength: 50
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    maxLength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxLength: 150
  },
  /* Khóa tài khoản */
  active: {
    type: Boolean,
    default: true,
    require: true
  },
  password: {
    type: String,
    maxLength: 255,
    require: false,
    default: null
  },
  role:{
    type: Number,
    default: 2
  }
},
{
  timestamps: true, //Tạo tự động thêm 2 trường createAt, updateAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

staffSchema.virtual('fullname').get(function () {
  return this.last_name + ' ' + this.first_name;
});

staffSchema.pre('save', async function (next) {
  const staff = this;

  if (staff.password) {  
    const hash = bcrypt.hashSync(staff.password, saltRounds);
    staff.password = hash;
  }

  next();
});
const Staff = model<IStaff>('Staff', staffSchema);

export default Staff