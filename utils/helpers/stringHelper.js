/**
 * Chuẩn hóa chuỗi: loại bỏ dấu tiếng Việt và chuyển thành chữ thường
 * @param {string} str - Chuỗi cần xử lý
 * @returns {string} Chuỗi đã loại bỏ dấu và chuyển thành chữ thường
 */

export const normalizeText = str => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
};

/**
 * Tìm kiếm không phân biệt hoa thường và dấu
 * @param {string} text - Chuỗi cần tìm kiếm trong
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @returns {boolean} true nếu tìm thấy, false nếu không
 */

export const searchWithoutDiacritics = (text, searchTerm) => {
  if (!text || !searchTerm) return false;
  const normalizedText = normalizeText(text);
  const normalizedSearchTerm = normalizeText(searchTerm);
  return normalizedText.includes(normalizedSearchTerm);
};

