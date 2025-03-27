import React from "react";
import Image from "next/image";
import facebookImg from "../../../public/image/facebook.png";
import zaloImg from "../../../public/image/zalo.png";
import tiktokImg from "../../../public/image/tiktok.png";
import mailImg from "../../../public/image/mail.png";
import vnpayImg from "../../../public/image/vnpay.png";
// import mastercardImg from "../../../public/image/master-card.png";
import momoImg from "../../../public/image/momo.png";
import napasImg from "../../../public/image/napas.png";
import zalopayImg from "../../../public/image/zalopay.png";
import bocongthuongImg from "../../../public/image/bo-cong-thuong.png";
import dmcaImg from "../../../public/image/dmca.png";
// import jcbImg from "../../../public/image/jcb.png";
// import amexImg from "../../../public/image/amex.png";
// import foxpayImg from "../../../public/image/foxpay.png";
// import alepayImg from "../../../public/image/alepay.png";
// import muadeeImg from "../../../public/image/muadee.png";
// import applepayImg from "../../../public/image/applepay.jpg";
// import samsungpayImg from "../../../public/image/samsungpay.jpg";
// import googlepayImg from "../../../public/image/googlepay.png";
// import visaImg from "../../../public/image/visa.png";
import Link from "next/link";
const Footer = () => {
  const itemContact = [
    {
      icon: facebookImg,
      altIcon: "Facebook",
      width: 40,
      height: 24,
      url: "http://www.facebook.com/oxaemneee",
    },
    {
      icon: zaloImg,
      altIcon: "Zalo",
      width: 40,
      height: 24,
      url: "https://zalo.me/84332146137",
    },
    {
      icon: tiktokImg,
      altIcon: "Tiktok",
      width: 40,
      height: 24,
      url: "https://www.tiktok.com/@tuananhneba",
    },
    {
      icon: mailImg,
      altIcon: "Mail",
      width: 38,
      height: 24,
      url: "mailto:tuananhhdev@gmail.com",
    },
  ];

  return (
    <footer className="bg-[#101010] pb-4 pt-8 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Cột 1: Kết nối */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">🌐 KẾT NỐI VỚI TOPZONE</h3>
            <div className="flex space-x-3">
              {itemContact.map((item, index) => {
                return (
                  <Link key={index} href={item.url}>
                    <Image
                      src={item.icon}
                      alt={item.altIcon}
                      width={item.width}
                      height={item.height}
                      className={`transition-transform duration-300 hover:scale-110 ${
                        item.altIcon === "Mail" ? "rounded-full bg-white p-1" : ""
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
            <p className="mb-2 mt-11 text-lg font-semibold">☎️ Tổng đài</p>
            <p className="text-sm">
              Tư vấn mua hàng : <strong>1800.6601</strong> ( Nhánh 1 )
            </p>
            <p className="text-sm">
              Góp ý, khiếu nại : <strong>1800.6616</strong> ( 8h - 22h )
            </p>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">🏢 VỀ CHÚNG TÔI</h3>
            <ul className="space-y-2 text-sm">
              <li>Giới thiệu công ty</li>
              <li>Quy chế hoạt động</li>
              <li>Tin tức khuyến mại</li>
              <li>Hướng dẫn mua hàng</li>
              <li>Tra cứu hóa đơn điện tử</li>
              <li>Chính sách bảo hành</li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">📜 CHÍNH SÁCH</h3>
            <ul className="space-y-2 text-sm">
              <li>Chính sách bảo mật</li>
              <li>Chính sách đổi trả</li>
              <li>Chính sách giao hàng</li>
              <li>Chính sách trả góp</li>
            </ul>
          </div>

          {/* Cột 4: Hỗ trợ thanh toán */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">💳 HỖ TRỢ THANH TOÁN</h3>
            <div className="flex flex-wrap gap-3">
              {/* <Image
                src={visaImg}
                alt="Visa"
                width={50}
                height={30}
                className="rounded-lg transition-transform duration-300 hover:scale-110"
              />
              <Image
                src={mastercardImg}
                alt="Master Card"
                width={50}
                height={30}
                className="rounded-lg bg-white p-1 transition-transform duration-300 hover:scale-110"
              />
              <Image
                src={jcbImg}
                alt="JCB"
                width={50}
                height={30}
                className="rounded-lg transition-transform duration-300 hover:scale-110"
              />
              <Image
                src={amexImg}
                alt="Amex "
                width={50}
                height={30}
                className="rounded-lg transition-transform duration-300 hover:scale-110"
              /> */}
              <Image
                src={vnpayImg}
                alt="VNPay"
                width={50}
                height={30}
                className="rounded-lg transition-transform duration-300 hover:scale-110"
              />
              <Image
                src={napasImg}
                alt="Napas"
                width={50}
                height={30}
                className="rounded-lg transition-transform duration-300 hover:scale-110"
              />

              <Image
                src={zalopayImg}
                alt="Zalo Pay"
                width={50}
                height={30}
                className="rounded-lg transition-transform duration-300 hover:scale-110"
              />
              <Image
                src={momoImg}
                alt="Momo"
                width={50}
                height={30}
                className="rounded-lg transition-transform duration-300 hover:scale-110"
              />
            </div>

            <h3 className="mt-10 text-lg font-semibold">✅ CHỨNG NHẬN</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Image src={bocongthuongImg} alt="Bộ Công Thương" width={100} height={32} />
              <Image src={dmcaImg} alt="DMCA" width={90} height={30} className="rounded-[14px]" />
              {/* <Image
                src={dmcaImg}
                alt="Secure"
                width={50}
                height={30}
              /> */}
            </div>
          </div>
        </div>

        {/* Đường kẻ ngang */}
        <hr className="my-6 border-gray-700" />

        {/* Thông tin bản quyền */}
        <div className="text-center text-sm text-gray-400">
          <p>© 2007 - 2025 Công Ty Cổ Phần Bán Lẻ Kỹ Thuật Số FPT</p>
          <p>Địa chỉ : 261 - 263 Khánh Hội, P2, Q4, TP. Hồ Chí Minh</p>
          <p>Email : topzoneshop@topzone.com | Điện thoại: (028) 7302 3456</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
