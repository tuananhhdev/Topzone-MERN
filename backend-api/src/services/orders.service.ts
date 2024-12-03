import Order from "../models/orders.model";
import createError from 'http-errors'
import { IOrder } from "../types/model.types"
import Customer from '../models/customers.model';
import nodemailer from 'nodemailer';
import { paymentType } from "../configs/order.config";

// Tạo transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'maitanhung2@gmail.com',
    pass: 'rckcvggbswzkulbs' //mật khẩu ứng dụng
  }
} as nodemailer.TransportOptions);

// Lấy tất cả record
const findAllOrder = async (query: any) => {
  /* Phân trang */
  const page_str = query.page;
  const limit_str = query.limit;
  const orderStatus_str = query.order_status;
  const paymentType_str = query.payment_type;

  const page = page_str ? parseInt(page_str as string) : 1;
  const limit = limit_str ? parseInt(limit_str as string) : 10;

  const payment_type = paymentType_str ? parseInt(paymentType_str as string) : 0;
  const order_status = orderStatus_str ? parseInt(orderStatus_str as string) : 0;


  /* Sắp xếp */
  let objSort: any = {};
  const sortBy = query.sort || 'createdAt'; // Mặc định sắp xếp theo ngày tạo giảm dần
  const orderBy = query.order && query.order == 'ASC' ? 1 : -1
  objSort = { ...objSort, [sortBy]: orderBy } // Thêm phần tử sắp xếp động vào object {}

  const offset = (page - 1) * limit;

  let objectCustomerFilters: any = {};
  let objectOrderFilters: any = {};
  // Lọc theo số ĐT
  if (query.phone && query.phone != '') {
    objectCustomerFilters = { ...objectCustomerFilters, phone: new RegExp(query.phone, 'i') }
  }
  // Lọc theo số Tên
  if (query.keyword && query.keyword !== '') {
    objectCustomerFilters = {
      ...objectCustomerFilters,
      $or: [
        { first_name: new RegExp(query.keyword, 'i') },
        { last_name: new RegExp(query.keyword, 'i') }
      ]
    };
  }
  // Lọc theo order_status
  if (order_status != 0) {
    objectOrderFilters = { ...objectOrderFilters, order_status: order_status }
  }
  // lọc theo payment_type
  if (payment_type != 0) {
    objectOrderFilters = { ...objectOrderFilters, payment_type: payment_type }
  }

  /* Select * FROM product */
  const orders = await Order
    .find(objectOrderFilters)
    .select('-__v -id')
    .populate({
      path: 'customer',
      select: 'first_name phone',  // Loại bỏ trường password
      /**
       * Với match, nếu ko khớp thì customer là null
       */
      match: objectCustomerFilters
    })
    .populate({
      path: 'staff',
    })
    .populate('order_items.product', '_id product_name price slug thumbnail')
    .sort(objSort)
    .skip(offset)
    .limit(limit)
    .lean({ virtuals: true })
    ;

  console.log('<<=== 🚀 orders ===>>', orders);

  /**
    * Với match, nếu ko khớp thì customer là null
    * Do vậy nếu customer null ko thỏa mãn thì bỏ qua
    */
  // Lọc ra các orders mà có customer không null (có kết quả phù hợp)
  const ordersWithConditions = orders.filter(order => order.customer);

  // const totalRecords = ordersWithConditions.length;
  const totalRecords = await Order.countDocuments(objectOrderFilters);

  return {
    orders_list: ordersWithConditions,
    sorts: objSort,
    filters: {},
    // Phân trang
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalRecords / limit), //tổng số trang
      totalRecords
    }
  }
}
// Tìm 1 record theo ID
const findById = async (id: string) => {
  //Đi tìm 1 cái khớp id
  const order = await Order
    .findById(id)
    .populate('customer', '-__v -password')
    .populate('staff', '-__v -password')
    .populate('order_items.product', '_id product_name slug thumbnail')
    .lean({ virtuals: true })

  /* Bắt lỗi khi ko tìm thấy thông tin */
  if (!order) {
    throw createError(400, 'Order Not Found')
  }

  return order
}
/*
Logic tạo đơn hàng 
1. Nếu khách đã login thì check và lấy thông tin customer từ header, dựa vào token
2. Nếu chưa login thì check nếu tồn tại email, mobile chưa. Nếu chưa thì tạo mới customer
3. Tạo đơn dựa trên thông tin customer
4. Mặc định để thông tin staff là null, vì chưa có ai duyệt đơn
*/
const createRecordOrder = async (payload: any, customerLogined: any) => {
  console.log('payload order', payload);
  const total = payload.order_items.reduce((sum: number, item: { price_end: number; quantity: number }) => {
    return sum + item.price_end * item.quantity;
  }, 0);
  //TH 2. Khách đã login
  if (customerLogined && customerLogined._id) {
    const payload_order = {
      customer: customerLogined._id,
      payment_type: payload.payment_type,
      street: payload.customer.street,
      city: payload.customer.city,
      state: payload.customer.state,
      order_note: payload.order_note,
      order_items: payload.order_items

    }
    const order = await Order.create(payload_order)

    if (order) {
      console.log('Tao don thanh cong', payload.customer.email);
      // Tạo nội dung email
      const mailOptions = {
        from: 'maitanhung2@gmail.com',
        to: customerLogined.email, //email khach hang
        subject: 'Xac nhan dat hang',
        html: `
        <h1>Xác nhận đặt hàng</h1>
        <p>Xin chào <strong>${payload.customer.first_name} ${payload.customer.last_name}</strong>,</p>
        <p>Email: ${payload.customer.email}</p>
        <p>Số điện thoại: ${payload.customer.phone}</p>
        <p>Địa chỉ: ${payload.customer.street} , ${payload.customer.city} , ${payload.customer.state} </p>
        
        <p>Chúng tôi đã nhận được đơn hàng của bạn với thông tin sau:</p>
        <p><strong>Phương thức thanh toán:</strong> ${paymentType[payload.payment_type]}</p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Tên sản phẩm</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Giá</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Số lượng</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${payload.order_items.map((item: { product_name: string; price_end: number; quantity: number }) => `
              <tr>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.product_name}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.price_end.toLocaleString('vi-VN')} VNĐ</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.quantity}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${(item.price_end * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>Tổng số tiền:</strong></td>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>${total.toLocaleString('vi-VN')} VNĐ</strong></td>
            </tr>
          </tfoot>
        </table>

        <p>Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi!</p>
      `,
      };
      // Gửi email
      transporter.sendMail(mailOptions, (error: Error | null, info: nodemailer.SentMessageInfo) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
    return order;
  }
  //TH 1. Khách hàng chưa tồn tại tại trong hệ thống
  // if (!payload.customer) {
  //   throw createError(400, 'Thông tin khách hàng không hợp lệ')
  // }
  const checkExistCustomer = await Customer.findOne({
    $or: [
      { phone: payload.customer.phone },
      { email: payload.customer.email }
    ]
  });


  let customerId
  if (!checkExistCustomer) {
    //Đi tạo tạo khách hàng mới
    const customer = await Customer.create(payload.customer)
    customerId = customer._id
  } else {
    customerId = checkExistCustomer._id
  }
  //Sau đó tạo đơn
  const payload_order = {
    customer: customerId,
    payment_type: payload.payment_type,
    street: payload.customer.street,
    city: payload.customer.city,
    state: payload.customer.state,
    order_note: payload.customer.order_note,
    order_items: payload.order_items
  }
  const order = await Order.create(payload_order)

  if (order) {
    console.log('Tao don thanh cong', payload.customer.email);
    // Tạo nội dung email
    
    const mailOptions = {
      from: 'maitanhung2@gmail.com',
      to: payload.customer.email, //email khach hang
      subject: 'Xac nhan dat hang',
      html: `
        <h1>Xác nhận đặt hàng</h1>
        <p>Xin chào <strong>${payload.customer.first_name} ${payload.customer.last_name}</strong>,</p>
        <p>Email: ${payload.customer.email}</p>
        <p>Số điện thoại: ${payload.customer.phone}</p>
        <p>Địa chỉ: ${payload.customer.street} , ${payload.customer.city} , ${payload.customer.state} </p>
        
        <p>Chúng tôi đã nhận được đơn hàng của bạn với thông tin sau:</p>
        <p><strong>Phương thức thanh toán:</strong> ${paymentType[payload.payment_type]}</p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Tên sản phẩm</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Giá</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Số lượng</th>
              <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${payload.order_items.map((item: { product_name: string; price_end: number; quantity: number }) => `
              <tr>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.product_name}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.price_end.toLocaleString('vi-VN')} VNĐ</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.quantity}</td>
                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${(item.price_end * item.quantity).toLocaleString('vi-VN')} VNĐ</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>Tổng số tiền:</strong></td>
              <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><strong>${total.toLocaleString('vi-VN')} VNĐ</strong></td>
            </tr>
          </tfoot>
        </table>
        <p>Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi!</p>
      `,
    };
    // Gửi email
    transporter.sendMail(mailOptions, (error: Error | null, info: nodemailer.SentMessageInfo) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
  return order
}
const updateById = async (id: string, payload: IOrder) => {
  //b1.Kiểm tra sự tồn tại của danh mục có id này
  const order = await Order.findByIdAndUpdate(id, payload, {
    new: true, // nó trả về record sau khi update
  })
  console.log('=>> order ===>>', order);
  /* Bắt lỗi khi ko tìm thấy thông tin */
  if (!order) {
    throw createError(400, 'Order Not Found')
  }
  //Return về record vừa đc update
  return order
}
const deleteById = async (id: string) => {
  //b1 Kiểm tra xem tồn tại order có id
  const order = await Order.findByIdAndDelete(id)
  if (!order) {
    throw createError(400, 'Order Not Found')
  }
  return order
}
export default {
  findAllOrder,
  findById,
  createRecordOrder,
  updateById,
  deleteById
}