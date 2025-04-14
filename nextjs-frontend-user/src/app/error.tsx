"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="mt-52 text-center">
      <h2 className="text-5xl font-bold text-red-600">Something went wrong!</h2>
      <button
        className="mt-10 rounded-lg bg-black px-9 py-3 text-lg mb-10 text-white"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
