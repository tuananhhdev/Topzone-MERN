import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProductSkeleton = ({ count = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 border-b">
          {/* Ảnh sản phẩm */}
          <Skeleton width={80} height={80} />

          {/* Thông tin sản phẩm */}
          <div className="flex-1 grid grid-cols-7 gap-4">
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="100%" />
          </div>

          {/* Hành động */}
          <div className="flex gap-2">
            <Skeleton circle width={24} height={24} />
            <Skeleton circle width={24} height={24} />
            <Skeleton circle width={24} height={24} />
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
