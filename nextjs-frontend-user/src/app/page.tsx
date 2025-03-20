// "use client";
import CarouselHome from "@/components/CarouselHome";
import "../styles/ProductPage.css";
import CategoryHome from "@/components/CategoryHome";
// import Chatbox from "@/components/ChatBox";
// import { usePathname } from "next/navigation";
import ProductList from "@/components/ProductList";
import ScrollToTop from "@/components/ScrollToTop";
import CateCarouselHome from "@/components/CateCarouselHome";
import BannerAd from "@/components/BannerAd";
import CateLaptop from "@/components/CateLaptop";
// import ChatbotComponent from "@/components/ChatBot/ChatBot";
export default function Home() {
  return (
    <>
      {" "}
      <CarouselHome />
      <div className="main-container">
        <CategoryHome />
        <CateCarouselHome />
        <ProductList />
        <BannerAd/>
        <CateLaptop/>
        <ScrollToTop />

        {/* <Chatbox /> */}

        {/* <ChatbotComponent/> */}
      </div>
    </>
  );
}
