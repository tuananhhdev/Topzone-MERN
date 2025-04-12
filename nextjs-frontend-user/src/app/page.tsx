import "../styles/ProductPage.css";
import CategoryHome from "@/components/CategoryHome";
// import Chatbox from "@/components/ChatBox";
// import { usePathname } from "next/navigation";
import ProductList from "@/components/ProductList";
import ScrollToTop from "@/components/ScrollToTop";
import CateCarouselHome from "@/components/CateCarouselHome";
import BannerAd from "@/components/BannerAd";
import CateLaptop from "@/components/CateLaptop";
import PaymentIncentivesCarousel from "@/components/PaymentIncentivesCarousel";
import PCCarousel from "@/components/PCCarousel";
import ServicesHome from "@/components/ServicesHome";
import BenefitsHome from "@/components/BenefitsHome";
import SupportHome from "@/components/SupportHome";
import CarouselHomeServer from "@/components/CarouselHomeServer";
// import ChatbotComponent from "@/components/ChatBot/ChatBot";

export default function Home() {
  return (
    <>
      {" "}
      <CarouselHomeServer />
      <div className="main-container">
        <CategoryHome />
        <CateCarouselHome />
        <ProductList />
        <BannerAd />
        <CateLaptop />
        <ScrollToTop />
        <PaymentIncentivesCarousel />
        <PCCarousel />
        <ServicesHome />
        <SupportHome />
        <BenefitsHome />
       
        {/* <Chatbox /> */}

        {/* <ChatbotComponent/> */}
      </div>
    </>
  );
}
