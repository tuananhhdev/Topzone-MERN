
const ProductDetail = ({ product }) => {
  return (
    <div>
      {/* Existing product details */}
      {/* Product Specifications */}
      <div className="mt-8">
        <ProductSpecifications specifications={product.specifications} />
      </div>
    </div>
  );
};

export default ProductDetail; 