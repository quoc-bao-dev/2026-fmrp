/**
 * [session-web] Hàm tạo/lấy session theo TAB (sống trong sessionStorage)
 * @description Tạo hoặc lấy session ID duy nhất cho mỗi tab trình duyệt
 * @returns {string} Session ID dạng "fmrp_xxxxx" (10 ký tự ngẫu nhiên)
 * @example
 * const sessionId = getOrCreateTabSession();
 * // Returns: "fmrp_a1b2c3d4e5"
 */
export const getOrCreateTabSession = () => {
  try {
    const KEY = 'fmrp_tab_session';
    let current = sessionStorage.getItem(KEY);
    if (current) return current;
    const randomPart =
      typeof crypto !== 'undefined' && crypto?.getRandomValues
        ? Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => (b % 36).toString(36))
            .join('')
            .slice(0, 10)
        : Math.random().toString(36).slice(2, 12);
    current = `fmrp_${randomPart}`;
    sessionStorage.setItem(KEY, current);
    return current;
  } catch (e) {
    // Fallback khi sessionStorage không khả dụng
    return `fmrp_${Math.random().toString(36).slice(2, 12)}`;
  }
};
