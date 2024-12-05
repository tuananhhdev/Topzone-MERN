import React from "react";
import useTitle from "../../hooks/useTitle";

const ProductList: React.FC = () => {
  useTitle('Topzone - Products List');
  return (
    <div>
      <h1 className="font-semibold">Product List</h1>
    </div>
  );
};

export default ProductList;
