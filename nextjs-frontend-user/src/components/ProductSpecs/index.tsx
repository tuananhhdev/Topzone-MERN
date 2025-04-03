import React, { useContext, useRef, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabContext } from "@/context/TabContext";
import { Button } from "../ui/button";

const ProductSpecs = () => {
  const { handleTabChange, specification } = useContext(TabContext);
  const contentRefs = useRef({});
  const [activeTab, setActiveTab] = useState(Object.keys(specification)[0]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      let newActiveTab = activeTab;

      Object.keys(specification).forEach((tab) => {
        const tabContent = contentRefs.current[tab]?.current;
        if (tabContent) {
          const rect = tabContent.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            newActiveTab = tab;
          }
        }
      });

      if (newActiveTab !== activeTab) {
        setActiveTab(newActiveTab);
        handleTabChange(newActiveTab);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [specification, handleTabChange, activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    handleTabChange(tab);
    if (contentRefs.current[tab]?.current) {
      contentRefs.current[tab].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger>
        <Button>Xem tất cả thông số</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle>Thông số kỹ thuật</SheetTitle>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="sticky top-0 bg-white z-10 border-b">
            {Object.keys(specification).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 border-b-2 transition-colors duration-200 ${
                  activeTab === tab ? "border-b-rose-500" : "border-transparent"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent
            value={activeTab}
            className="h-[calc(100vh-10rem)] overflow-y-scroll"
          >
            {Object.keys(specification).map((tab) => (
              <div
                key={tab}
                ref={(element) => {
                  if (element) {
                    if (!contentRefs.current[tab]) {
                      contentRefs.current[tab] = { current: element };
                    }
                  }
                }}
                data-tab={tab}
              >
                <h2 className="text-lg font-semibold mt-4 mb-2">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </h2>
                {Object.entries(specification[tab]).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b">
                    <strong className="w-2/5 font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </strong>
                    <span className="w-3/5">
                      {Array.isArray(value) ? value.join(", ") : value}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ProductSpecs;
