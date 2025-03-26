import { SETTINGS } from "@/config/settings";
import CarouselHome from "../CarouselHome";

export default async function CarouselHomeServer() {
  const res = await fetch(`${SETTINGS.URL_API}/v1/banners`, {
    cache: "no-store", // 🔥 Đảm bảo dữ liệu luôn mới
  });

  if (!res.ok) {
    console.error("Error fetching banners");
    return <p>Failed to load banners.</p>;
  }

  const data = await res.json();

  console.log("Banners Data:", data.data);
  return <CarouselHome banners={data.data || []} />;
}
