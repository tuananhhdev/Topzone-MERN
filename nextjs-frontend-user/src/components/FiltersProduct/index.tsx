import React from "react";
import ProductItem from "../ProductItem";

const FilterProduct = () => {
  return (
    <section>
      {/* Container */}
      <div className="mx-auto w-full px-5 py-16 md:px-10 md:py-24">
        {/* Component */}
        <div className="flex flex-col gap-12">
          {/* Title */}
          <div className="flex flex-col gap-5">
            <h3 className="text-2xl font-bold md:text-5xl">Filter products</h3>
            <p className="text-sm text-[#808080] sm:text-base">
              Lorem ipsum dolor sit amet
            </p>
          </div>
          {/* Content */}
          <div className="grid gap-10 md:gap-12 lg:grid-cols-[max-content_1fr]">
            {/* Filters */}
            <div className="mb-4 max-w-none lg:max-w-sm">
              <form
                name="wf-form-Filter-2"
                method="get"
                className="flex-col gap-6"
              >
                {/* Filters title */}
                <div className="mb-6 flex items-center justify-between py-4 [border-bottom:1px_solid_rgb(217,_217,_217)]">
                  <h5 className="text-xl font-bold">Filters</h5>
                  <a href="#" className="text-sm">
                    <p>Clear all</p>
                  </a>
                </div>
                {/* Search input */}
                <input
                  type="text"
                  className="mb-10 block h-9 min-h-[44px] w-full rounded-md border border-solid border-[#cccccc] bg-[#f2f2f7] bg-[16px_center] bg-no-repeat py-3 pl-11 pr-4 text-sm font-bold text-[#333333] [background-size:18px] [border-bottom:1px_solid_rgb(215,_215,_221)]"
                  placeholder="Search"
                  style={{
                    backgroundImage:
                      'url("https://assets.website-files.com/6458c625291a94a195e6cf3a/64b7a3a33cd5dc368f46daaa_MagnifyingGlass.svg")',
                  }}
                />
                {/* Categories */}
                <div className="flex flex-col gap-6">
                  <p className="font-semibold">Categories</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="#"
                      className="flex gap-3 rounded-md bg-[#f2f2f7] p-3 font-semibold"
                    >
                      <img
                        src="https://assets.website-files.com/6458c625291a94a195e6cf3a/64b7a3a33cd5dc368f46daab_design.svg"
                        alt=""
                        className="inline-block"
                      />
                      <p>Design</p>
                    </a>
                    <a
                      href="#"
                      className="flex gap-3 rounded-md bg-[#f2f2f7] p-3 font-semibold"
                    >
                      <img
                        src="https://assets.website-files.com/6458c625291a94a195e6cf3a/64b7a3a33cd5dc368f46daae_illustration.svg"
                        alt=""
                        className="inline-block"
                      />
                      <p>Illustrations</p>
                    </a>
                    <a
                      href="#"
                      className="flex gap-3 rounded-md bg-[#f2f2f7] p-3 font-semibold"
                    >
                      <img
                        src="https://assets.website-files.com/6458c625291a94a195e6cf3a/64b7a3a33cd5dc368f46daad_icons.svg"
                        alt=""
                        className="inline-block"
                      />
                      <p>Icons</p>
                    </a>
                    <a
                      href="#"
                      className="flex gap-3 rounded-md bg-[#f2f2f7] p-3 font-semibold"
                    >
                      <img
                        src="https://assets.website-files.com/6458c625291a94a195e6cf3a/64b7a3a33cd5dc368f46daaf_plugins.svg"
                        alt=""
                        className="inline-block"
                      />
                      <p>Plugins</p>
                    </a>
                    <a
                      href="#"
                      className="flex gap-3 rounded-md bg-[#f2f2f7] p-3 font-semibold"
                    >
                      <img
                        src="https://assets.website-files.com/6458c625291a94a195e6cf3a/64b7a3a33cd5dc368f46daac_color%20palette.svg"
                        alt=""
                        className="inline-block"
                      />
                      <p>Color Palette</p>
                    </a>
                  </div>
                </div>
                {/* Divider */}
                <div className="mb-6 mt-6 h-px w-full bg-[#d9d9d9]"></div>
                {/* Rating */}
                <div className="flex flex-col gap-6">
                  <p className="font-semibold">Rating</p>
                  <div className="flex flex-wrap gap-2 lg:justify-between">
                    <div className="flex h-9 w-14 cursor-pointer items-center justify-center rounded-md border border-solid border-[#cccccc] bg-[#f2f2f7] text-sm font-semibold">
                      <span>1</span>
                    </div>
                    <div className="flex h-9 w-14 cursor-pointer items-center justify-center rounded-md border border-solid border-[#cccccc] bg-black text-sm font-semibold text-white">
                      <span>2</span>
                    </div>
                    <div className="flex h-9 w-14 cursor-pointer items-center justify-center rounded-md border border-solid border-[#cccccc] bg-[#f2f2f7] text-sm font-semibold">
                      <span>3</span>
                    </div>
                    <div className="flex h-9 w-14 cursor-pointer items-center justify-center rounded-md border border-solid border-[#cccccc] bg-[#f2f2f7] text-sm font-semibold">
                      <span>4</span>
                    </div>
                    <div className="flex h-9 w-14 cursor-pointer items-center justify-center rounded-md border border-solid border-[#cccccc] bg-[#f2f2f7] text-sm font-semibold">
                      <span>5</span>
                    </div>
                  </div>
                </div>
                {/* Divider */}
                <div className="mb-6 mt-6 h-px w-full bg-[#d9d9d9]"></div>
                {/* FIlter One */}
                <div className="flex flex-col gap-6">
                  <div className="flex cursor-pointer items-center justify-between py-4 [border-top:1px_solid_rgba(0,_0,_0,_0)] md:py-0">
                    <p className="font-semibold">FIlter One</p>
                    <a href="#" className="inline-block text-sm text-black">
                      <p>Clear</p>
                    </a>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center text-sm font-medium">
                      <div className="mr-3 h-5 w-5 cursor-pointer rounded-sm border border-solid bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option One
                      </span>
                    </label>

                    <label className="flex items-center text-sm font-medium">
                      <div className="mr-3 h-5 w-5 cursor-pointer rounded-sm border border-solid bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option Two
                      </span>
                    </label>
                    <label className="flex items-center text-sm font-medium">
                      <div className="mr-3 h-5 w-5 cursor-pointer rounded-sm border border-solid bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option Three
                      </span>
                    </label>
                    <label className="flex items-center text-sm font-medium">
                      <div className="mr-3 h-5 w-5 cursor-pointer rounded-sm border border-solid bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option Four
                      </span>
                    </label>
                    <label className="flex items-center text-sm font-medium">
                      <div className="mr-3 h-5 w-5 cursor-pointer rounded-sm border border-solid bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option Five
                      </span>
                    </label>
                  </div>
                </div>
                {/* Divider */}
                <div className="mb-6 mt-6 h-px w-full bg-[#d9d9d9]"></div>
                {/* FIlter Two */}
                <div className="flex flex-col gap-6">
                  <div className="flex cursor-pointer items-center justify-between py-4 [border-top:1px_solid_rgba(0,_0,_0,_0)] md:py-0">
                    <p className="font-semibold">FIlter Two</p>
                    <a href="#" className="inline-block text-sm text-black">
                      <p>Clear</p>
                    </a>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center font-medium">
                      <div className="mr-3 mt-1 h-5 w-5 rounded-full border border-solid border-[#cccccc] bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">All</span>
                    </label>
                    <label className="flex items-center font-medium">
                      <div className="mr-3 mt-1 h-5 w-5 rounded-full border border-solid border-[#cccccc] bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option One
                      </span>
                    </label>
                    <label className="flex items-center font-medium">
                      <div className="mr-3 mt-1 h-5 w-5 rounded-full border border-solid border-[#cccccc] bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option Two
                      </span>
                    </label>
                    <label className="flex items-center font-medium">
                      <div className="mr-3 mt-1 h-5 w-5 rounded-full border border-solid border-[#cccccc] bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option Three
                      </span>
                    </label>
                    <label className="flex items-center font-medium">
                      <div className="mr-3 mt-1 h-5 w-5 rounded-full border border-solid border-[#cccccc] bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option Four
                      </span>
                    </label>
                    <label className="flex items-center font-medium">
                      <div className="mr-3 mt-1 h-5 w-5 rounded-full border border-solid border-[#cccccc] bg-[#f2f2f7]"></div>
                      <span className="inline-block cursor-pointer">
                        Option Five
                      </span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            {/* Decor */}
            <div className="w-full [border-left:1px_solid_rgb(217,_217,_217)]">
              {/* <div className="h-16 bg-[#cccccc]"></div> */}
              {/* <ProductItem /> */}
              hafjfhajhd
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterProduct;
