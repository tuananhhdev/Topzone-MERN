import React from "react";

import ProductSpecs from "../ProductSpecs";
import { TabProvider } from "@/context/TabContext";
interface Specification {
  screen: {
    size: string;
    technology: string;
    resolution: string;
    refresh_rate: string;
  };
  processor: {
    chip: string;
    gpu: string;
  };
  memory: {
    ram: string;
    storage: string;
  };
  camera: {
    main: string;
    selfie: string;
    features: string[];
  };
  battery: {
    capacity: string;
    charging: string;
  };
  connectivity: {
    sim: string;
    network: string;
    wifi: string;
    bluetooth: string;
  };
  design: {
    dimensions: string;
    weight: string;
    material: string;
  };
  operating_system: string;
}

interface ProductInfoProps {
  specification: Specification;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ specification }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* <div className="flex-1 bg-white rounded-xl drop-shadow hover:shadow-xl p-6  "> */}
      <div className="bg-white rounded-xl shadow-[0px_5px_15px_rgba(0,0,0,0.35)] p-6  ">
        <h2 className="text-xl font-bold mb-4">Thông số kỹ thuật</h2>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">CPU</span>
            <span className="flex-1 text-gray-600">
              {specification.processor.chip}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">RAM</span>
            <span className="flex-1 text-gray-600">
              {specification.memory.ram}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">Ổ cứng</span>
            <span className="flex-1 text-gray-600">
              {specification.memory.storage}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">VGA</span>
            <span className="flex-1 text-gray-600">
              {specification.processor.gpu}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">Màn hình</span>
            <span className="flex-1 text-gray-600">
              {specification.screen.size}, {specification.screen.technology},{" "}
              {specification.screen.resolution},{" "}
              {specification.screen.refresh_rate}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">
              Cổng giao tiếp
            </span>
            <span className="flex-1 text-gray-600">
              SIM {specification.connectivity.sim}, Mạng{" "}
              {specification.connectivity.network}, WiFi{" "}
              {specification.connectivity.wifi}, Bluetooth{" "}
              {specification.connectivity.bluetooth}
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">Bàn phím</span>
            <span className="flex-1 text-gray-600">
              24-Zone RGB Gaming Keyboard
            </span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">Audio</span>
            <span className="flex-1 text-gray-600">2 x 2W Speaker</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold w-32 text-gray-700">Chuẩn LAN</span>
            <span className="flex-1 text-gray-600">Gigabit Ethernet</span>
          </div>

          {/* Button show all specs  */}
          <TabProvider specification={specification}>
            <ProductSpecs />
          </TabProvider>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
