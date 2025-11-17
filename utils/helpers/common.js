import { ERROR_DISCOUNT_MAX } from '@/constants/errorStatus/errorStatus';
import useToast from '@/hooks/useToast';
import { STREAMING_TEXT_CONFIG } from '@/configs/configStreamingText';
const isShow = useToast();
const convertArrayToObject = (array, key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};

const parseArrayToString = array => array.join(',');

const parseStringToArray = str => str.split(',');

const parseStringToObject = str => {
  const keys = str.split(',');
  return keys.reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {});
};

const isAllowedDiscount = values => {
  const { floatValue } = values;
  if (floatValue === 0) {
    return true;
  }
  if (floatValue > 100) {
    isShow('error', ERROR_DISCOUNT_MAX);
    return false;
  }
  return true;
};

const isAllowedNumber = values => {
  const { floatValue } = values;
  if (floatValue == 0) {
    return true;
  } else {
    return true;
  }
};
const isAllowedNumberThanWarning = (values, dataLang) => {
  const { floatValue, value } = values;
  if (floatValue == 0) {
    return true;
  }
  if (floatValue < 0) {
    isShow('error', dataLang?.productions_orders_popup_please_enter_greater || 'productions_orders_popup_please_enter_greater');
    return false;
  }
  return true;
};

export const handleDelay = ({ actionFn, delay = 2000, setIsLoading }) => {
  if (typeof setIsLoading === 'function') setIsLoading(true);

  setTimeout(() => {
    if (typeof setIsLoading === 'function') setIsLoading(false);
    if (typeof actionFn === 'function') actionFn();
  }, delay);
};

/**
 * Hàm delay đơn giản để chờ một khoảng thời gian
 * @param {number} ms - Thời gian delay tính bằng milliseconds
 * @returns {Promise} Promise sẽ resolve sau khi delay xong
 */
export const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Tính toán thời gian cần thiết để render hết một message (dựa trên streaming effect)
 *
 * Logic giống hệt với component StreamingText trong Messenger.jsx:
 * 1. Messenger.jsx: children (HTML string) → parse(children) → React elements → getTextContent() → fullText
 * 2. StreamingText: fullText → stream từng ký tự với setTimeout(stream, speed) cho mỗi ký tự
 * 3. Tổng thời gian = fullText.length * speed
 *
 * Hàm này mô phỏng quá trình đó:
 * - HTML string → DOM textContent (giống như parse + getTextContent) → text
 * - Tính số ký tự và nhân với speed
 *
 * @param {string} content - Nội dung message (HTML string, giống như children trong Messenger.jsx)
 * @param {number} speed - Tốc độ streaming tính bằng milliseconds per character (mặc định lấy từ STREAMING_TEXT_CONFIG.SPEED)
 * @returns {number} Thời gian tính bằng milliseconds
 * @example
 * calculateMessageRenderTime("Hello world") // => 165ms (11 ký tự * 15ms từ config)
 * calculateMessageRenderTime("<p>Hello <b>world</b></p>") // => 165ms (11 ký tự * 15ms, bỏ HTML tags)
 */
export const calculateMessageRenderTime = (content, speed = STREAMING_TEXT_CONFIG.SPEED) => {
  if (!content) return 0;

  // Messenger.jsx flow:
  // children (HTML string) → parse(children) → React elements → getTextContent() → fullText
  // Hàm này mô phỏng: HTML string → DOM textContent → text (kết quả giống nhau)

  let textContent = '';
  if (typeof content === 'string') {
    // Sử dụng DOM API để extract text content, giống như cách html-react-parser + getTextContent làm
    // html-react-parser parse HTML string thành React elements
    // getTextContent extract text từ React elements (bỏ tags, chỉ lấy text)
    // DOM textContent cũng làm tương tự (bỏ tags, chỉ lấy text, decode entities)
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      // textContent sẽ trả về text thuần, giống như getTextContent extract từ parsed React elements
      // Nó tự động bỏ HTML tags và decode HTML entities
      textContent = tempDiv.textContent || tempDiv.innerText || '';
    } else {
      // Fallback cho SSR: mô phỏng logic của getTextContent
      // Loại bỏ HTML tags và decode entities (best effort, không chính xác 100% như DOM API)
      textContent = content
        .replace(/<[^>]*>/g, '') // Loại bỏ HTML tags (giống như getTextContent bỏ qua React elements)
        .replace(/&nbsp;/g, ' ') // Decode &nbsp;
        .replace(/&amp;/g, '&') // Decode &amp;
        .replace(/&lt;/g, '<') // Decode &lt;
        .replace(/&gt;/g, '>') // Decode &gt;
        .replace(/&quot;/g, '"') // Decode &quot;
        .replace(/&#39;/g, "'") // Decode &#39;
        .replace(/&#x27;/g, "'") // Decode &#x27;
        .replace(/&#x2F;/g, '/') // Decode &#x2F;
        .trim();
    }
  } else {
    // Nếu không phải string, trả về 0 (giống như Messenger.jsx return null khi !children)
    return 0;
  }

  // Nếu không có text content, trả về 0 (giống như Messenger.jsx check !fullText || fullText.trim().length === 0)
  if (!textContent || textContent.trim().length === 0) {
    return 0;
  }

  // Tính số ký tự (bao gồm cả khoảng trắng và ký tự đặc biệt)
  // Đây chính xác là số ký tự mà StreamingText sẽ stream
  // Trong Messenger.jsx: fullText.length là số ký tự được stream
  const characterCount = textContent.length;

  // Thời gian render = số ký tự * tốc độ streaming
  // Trong Messenger.jsx: mỗi ký tự mất speed ms (setTimeout(stream, speed))
  // Tổng thời gian = characterCount * speed (không có delay thêm)
  // Lưu ý: Có setTimeout(stream, 0) để bắt đầu stream, nhưng delay này không đáng kể
  return characterCount * speed + 500;
};

export { isAllowedDiscount, isAllowedNumber, isAllowedNumberThanWarning, convertArrayToObject, parseStringToArray, parseStringToObject, parseArrayToString };
