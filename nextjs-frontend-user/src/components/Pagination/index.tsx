"use client";

import React, { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
}

const CustomPagination: React.FC<PaginationProps> = ({ totalPages }) => {
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setPage(page);
  };

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    if (page === 1) {
      currentParams.delete("page");
    } else {
      currentParams.set("page", page.toString());
    }

    router.push(`${pathname}?${currentParams.toString()}`);
  }, [page, searchParams, router, pathname]);

  return (
    <>
      <Stack spacing={2} alignItems="center" marginTop={4}>
        <Pagination
          count={totalPages}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
        />
      </Stack>
    </>
  );
};

export default CustomPagination;
