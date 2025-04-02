"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import YouTube from "react-youtube";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import ytbShortLogo from "../../../public/image/ytb-short-logo.png";
import "../../styles/product-youtube.css";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa6";

interface IProductYoutube {
  id: string;
  youtubeID: string;
  youtubeTitle: string;
}

const ProductYoutube: React.FC<{ youtubeVideos: IProductYoutube[] }> = ({
  youtubeVideos,
}) => {
  // State để kiểm soát việc hiển thị video
  const [playingVideos, setPlayingVideos] = useState<string[]>([]);

  const youtubeOpts = {
    width: "100%",
    height: "100%",
    playerVars: {
      controls: 1,
      iv_load_policy: 3,
      hl: "vi",
      modestbranding: 1,
      autoplay: 1, // Tự động phát khi nhấp vào
    },
  };

  // Hàm xử lý khi nhấp vào thumbnail
  const handlePlayVideo = (videoId: string) => {
    setPlayingVideos((prev) =>
      prev.includes(videoId) ? prev : [...prev, videoId]
    );
  };

  return (
    <div className="relative w-full">
      {/* Custom Navigation Buttons */}
      <div className="youtube-swiper-prev">
        <FaChevronLeft />
      </div>
      <div className="youtube-swiper-next">
        <FaChevronRight />
      </div>
      <h3 className="text-3xl font-semibold mb-3 -mt-2">Video liên quan</h3>
      <Swiper
        modules={[Navigation]}
        spaceBetween={10}
        slidesPerView={2.5}
        navigation={{
          prevEl: ".youtube-swiper-prev",
          nextEl: ".youtube-swiper-next",
        }}
        mousewheel={{ forceToAxis: true }} // Chỉ cho phép cuộn theo trục ngang
        simulateTouch={true} // Hỗ trợ kéo bằng chuột
        touchRatio={1} // Tỷ lệ cảm ứng
        grabCursor={true} // Hiển thị con trỏ dạng "kéo"
        speed={500} // Tốc độ chuyển slide (ms)
        resistanceRatio={0.85} // Giảm độ "dính" khi kéo đến giới hạn
        preventClicks={true} // Ngăn chặn nhấp chuột gây xung đột
        preventClicksPropagation={true} // Ngăn chặn sự kiện nhấp chuột lan truyền
        style={{
          userSelect: "none", // Ngăn chặn chọn văn bản khi kéo
          WebkitUserSelect: "none", // Hỗ trợ trên Safari
          touchAction: "pan-y", // Chỉ cho phép vuốt ngang, tránh xung đột với cuộn dọc
        }}
      >
        {youtubeVideos.map((video) => {
          const isPlaying = playingVideos.includes(video.youtubeID);

          return (
            <SwiperSlide key={video.id}>
              <div className="w-full flex items-center">
                <div className="w-full h-[415px] relative rounded-2xl overflow-hidden">
                  {/* Thumbnail Image */}
                  {!isPlaying && (
                    <div className="relative w-full h-full">
                      <Image
                        src={`https://img.youtube.com/vi/${video.youtubeID}/maxresdefault.jpg`} // Dùng thumbnail chất lượng cao
                        alt={video.youtubeTitle}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg cursor-pointer"
                        loading="lazy"
                        quality={80}
                        onClick={() => handlePlayVideo(video.youtubeID)} // Nhấp để phát video
                      />
                      {/* Thêm biểu tượng play từ một URL công khai (nếu thumbnail không có sẵn biểu tượng) */}
                      <div
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={() => handlePlayVideo(video.youtubeID)}
                      >
                        <Image
                          src={ytbShortLogo} // URL công khai của YouTube play button
                          alt="YouTube Play Button"
                          width={180}
                          height={180}
                          loading="lazy"
                          quality={80}
                          className="hover:opacity-80 transition-opacity duration-300"
                          style={{
                            pointerEvents: "auto",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* YouTube Video */}
                  {isPlaying && (
                    <div className="absolute top-0 left-0 w-full h-full z-10">
                      <YouTube
                        videoId={video.youtubeID}
                        opts={youtubeOpts}
                        className="w-full h-full"
                        iframeClassName="pointer-events-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ProductYoutube;
