/**
 * Format giây sang giờ:phút (ví dụ: 8h30p)
 * @param {number|string} seconds - Số giây cần format
 * @returns {string} - Chuỗi format theo định dạng giờ:phút (ví dụ: "8h30p", "8h", "30p", "0h", "-")
 */
export const formatSecondsToHours = seconds => {
  if (!seconds && seconds !== 0) return '-';
  const totalSeconds = Number(seconds) || 0;
  if (totalSeconds === 0) return '0h';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes}p`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}p`;
  } else {
    return '0h';
  }
};

/**
 * Format giây sang giờ:phút:giây chi tiết (ví dụ: 8h30p15s)
 * @param {number|string} seconds - Số giây cần format
 * @returns {string} - Chuỗi format theo định dạng giờ:phút:giây (ví dụ: "8h30p15s", "8h30p", "30p15s", "15s", "0s")
 */
export const formatSecondsToHoursMinutesSeconds = seconds => {
  const totalSeconds = Number(seconds) || 0;
  if (totalSeconds === 0) return '0s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h${minutes}p${secs > 0 ? secs + 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes}p${secs > 0 ? secs + 's' : ''}`;
  } else {
    return `${secs}s`;
  }
};

