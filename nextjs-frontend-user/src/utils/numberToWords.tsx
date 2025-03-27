const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const teens = [
  "mười",
  "mười một",
  "mười hai",
  "mười ba",
  "mười bốn",
  "mười lăm",
  "mười sáu",
  "mười bảy",
  "mười tám",
  "mười chín",
];
const tens = [
  "",
  "",
  "hai mươi",
  "ba mươi",
  "bốn mươi",
  "năm mươi",
  "sáu mươi",
  "bảy mươi",
  "tám mươi",
  "chín mươi",
];
const thousands = ["", "nghìn", "triệu", "tỷ"];

function convertToWords(num: number): string {
  if (num === 0) return "không đồng";

  let words = "";

  for (let i = 0; num > 0; i++) {
    const chunk = num % 1000;
    if (chunk) {
      const chunkWords = convertChunk(chunk);
      words = chunkWords + " " + thousands[i] + " " + words;
    }
    num = Math.floor(num / 1000);
  }

  return words.trim() + " đồng";
}

function convertChunk(num: number): string {
  let words = "";

  if (num > 99) {
    words += units[Math.floor(num / 100)] + " trăm ";
    num %= 100;
  }

  if (num > 19) {
    words += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  } else if (num > 9) {
    words += teens[num - 10] + " ";
    num = 0;
  }

  if (num > 0) {
    words += units[num] + " ";
  }

  return words.trim();
}

export { convertToWords };
