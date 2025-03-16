export function formatToVND(number: number) {
  return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
