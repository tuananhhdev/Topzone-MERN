import React from "react";
import "../../styles/filter.css"
const SideFilter = () => {
  return (
    <div className="side-filter">
      <h3>Filters</h3>
      <div className="filter-section">
        <h4>Categories</h4>
        <ul>
          <li>Phones</li>
          <li>Laptops</li>
          <li>TVs</li>
          <li>Accessories</li>
        </ul>
      </div>
      <div className="filter-section">
        <h4>Price Range</h4>
        <input type="range" min="0" max="1000" />
      </div>
    </div>
  );
};

export default SideFilter;
