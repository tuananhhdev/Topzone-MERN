"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Controller, useFormContext } from "react-hook-form";

type Province = {
  name: string;
  code: number;
  districts: District[];
};

type District = {
  name: string;
  code: number;
  wards: Ward[];
};

type Ward = {
  name: string;
  code: number;
};

const groupByFirstLetter = (list: { name: string; code: number }[]) => {
  const grouped = list.reduce(
    (acc, item) => {
      const letter = item.name.charAt(0).toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push({ label: item.name, value: item.code });
      return acc;
    },
    {} as Record<string, { label: string; value: number }[]>
  );

  return Object.keys(grouped)
    .sort()
    .map((letter) => ({
      label: letter,
      options: grouped[letter],
    }));
};

const ProvinceForm = () => {
  const { setValue, watch, control } = useFormContext();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const selectedProvince = watch("state");
  const selectedDistrict = watch("city");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
      const data = await res.json();
      setProvinces(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const province = provinces.find((p) => p.code === Number(selectedProvince));
    if (province) {
      setDistricts(province.districts);
      setValue("city", "");
      setValue("street", "");
    }
  }, [selectedProvince, provinces, setValue]);

  useEffect(() => {
    const district = districts.find((d) => d.code === Number(selectedDistrict));
    if (district) {
      setWards(district.wards);
      setValue("street", "");
    }
  }, [selectedDistrict, districts, setValue]);

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4 mt-4">
      <h2 className="font-semibold text-lg">Địa chỉ nhận hàng</h2>
      <Controller
        control={control}
        name="state"
        render={({ field }) => (
          <Select
            {...field}
            options={groupByFirstLetter(provinces)}
            placeholder="Chọn tỉnh/thành phố"
            onChange={(option) => field.onChange(option?.value)}
            value={
              field.value
                ? {
                    value: field.value,
                    label:
                      provinces.find((p) => p.code === Number(field.value))
                        ?.name || "",
                  }
                : null
            }
            isSearchable
          />
        )}
      />
      <Controller
        control={control}
        name="city"
        render={({ field }) => (
          <Select
            {...field}
            options={groupByFirstLetter(districts)}
            placeholder="Chọn quận/huyện"
            onChange={(option) => field.onChange(option?.value)}
            value={
              field.value
                ? {
                    value: field.value,
                    label:
                      districts.find((d) => d.code === Number(field.value))
                        ?.name || "",
                  }
                : null
            }
            isDisabled={!districts.length}
            isSearchable
          />
        )}
      />
      <Controller
        control={control}
        name="street"
        render={({ field }) => (
          <Select
            {...field}
            options={groupByFirstLetter(wards)}
            placeholder="Chọn phường/xã"
            onChange={(option) => field.onChange(option?.value)}
            value={
              field.value
                ? {
                    value: field.value,
                    label:
                      wards.find((w) => w.code === Number(field.value))?.name ||
                      "",
                  }
                : null
            }
            isDisabled={!wards.length}
            isSearchable
          />
        )}
      />
    </div>
  );
};

export default ProvinceForm;