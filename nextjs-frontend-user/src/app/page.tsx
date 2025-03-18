// "use client";
import CarouselHome from "@/components/CarouselHome";
import "../styles/ProductPage.css";
import CategoryHome from "@/components/CategoryHome";
import Chatbox from "@/components/ChatBox";
// import { usePathname } from "next/navigation";
import ProductList from "@/components/ProductList";
import ScrollToTop from "@/components/ScrollToTop";
// import ChatbotComponent from "@/components/ChatBot/ChatBot";
export default function Home() {
  // const pathname = usePathname();
  return (
    <>
      <CarouselHome />
      <CategoryHome />
      {/* <ProductList /> */}
      <ScrollToTop />
      {/* {pathname === "/" && <Chatbox />} */}
      {/* <Chatbox /> */}
     
      {/* <ChatbotComponent/> */}
    </>
  );
}
