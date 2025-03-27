import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  mainImage: string;
  altText: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, mainImage, altText }) => {
  const [selectedImage, setSelectedImage] = useState(mainImage);

  useEffect(() => {
    if (mainImage) {
      setSelectedImage(mainImage);
    }
  }, [mainImage]);

  if (!images || images.length === 0) {
    return (
      <div className="image-gallery">
        <div className="main-image">
          <Image
            src={mainImage}
            alt={altText}
            className="mt-5 w-full transform object-contain transition-transform duration-300 hover:scale-105"
            width={400}
            height={600}
            priority
          />
        </div>
        <p className="mt-4 text-center">No additional images available</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <div className="main-image">
        <Image
          src={selectedImage}
          alt={altText}
          className="mt-5 w-full transform object-contain transition-transform duration-300 hover:scale-105"
          width={400}
          height={600}
          priority
        />
      </div>
      <div className="thumbnail-images mt-4 flex space-x-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="thumbnail cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image}
              alt={`${altText} ${index + 1}`}
              className="h-20 w-20 border border-gray-300 object-cover"
              width={80}
              height={80}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
