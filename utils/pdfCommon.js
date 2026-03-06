import moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { styles } from '@/configs/style-Pdf/style';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

let _timesNewRomanLoaded = false;

// Theme màu dùng chung cho tất cả template PDF
export const PDF_THEME = {
  PRIMARY: '#0375F3',
  BORDER: '#E5E7EB',
  TEXT: '#111827',
  SUBTEXT: '#374151',
  CODETEXT: '#0375f3'
};
// Đường kẻ màu ở trên đầu trang
export const createTopLineBlock = PRIMARY => ({
  canvas: [
    {
      type: 'line',
      // tràn ra ngoài content để sát 2 mép trang (vì pageMargins left/right = 40)
      x1: -40,
      y1: 0,
      x2: 555,
      y2: 0,
      lineWidth: 5,
      lineColor: PRIMARY,
    },
  ],
  margin: [0, 0, 0, 12],
});


const arrayBufferToBase64 = buffer => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

export const ensureTimesNewRomanFonts = async () => {
  // Kiểm tra xem font đã được load chưa
  if (_timesNewRomanLoaded) {
    // Kiểm tra lại xem font có trong vfs không
    if (pdfMake.vfs && pdfMake.vfs['TimesNewRomanBold.ttf']) {
      return;
    }
    // Nếu flag đã set nhưng font không có trong vfs, reset flag để load lại
    _timesNewRomanLoaded = false;
  }

  if (typeof window === 'undefined') return;

  const basePath = '/fonts/times-new-roman';
  const files = {
    'TimesNewRoman.ttf': `${basePath}/TimesNewRoman.ttf`,
    'TimesNewRomanBold.ttf': `${basePath}/TimesNewRomanBold.ttf`,
    'TimesNewRomanItalic.ttf': `${basePath}/TimesNewRomanItalic.ttf`,
    'TimesNewRomanBoldItalic.ttf': `${basePath}/TimesNewRomanBoldItalic.ttf`,
  };

  try {
    // Load từng font và xử lý lỗi riêng cho từng file
    const entries = [];
    for (const [vfsName, url] of Object.entries(files)) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`Không tải được font: ${url}, sử dụng font mặc định`);
          continue; // Bỏ qua font này, tiếp tục với font khác
        }
        const buf = await res.arrayBuffer();
        entries.push([vfsName, arrayBufferToBase64(buf)]);
      } catch (error) {
        console.warn(`Lỗi khi tải font ${vfsName}:`, error);
        // Tiếp tục với các font khác
      }
    }

    // Chỉ thêm font vào vfs nếu có ít nhất 1 font được load thành công
    if (entries.length > 0) {
      pdfMake.vfs = { ...(pdfMake.vfs || {}), ...Object.fromEntries(entries) };

      // Chỉ thêm font definition nếu tất cả các font cần thiết đã được load
      const requiredFonts = ['TimesNewRoman.ttf', 'TimesNewRomanBold.ttf', 'TimesNewRomanItalic.ttf', 'TimesNewRomanBoldItalic.ttf'];
      const allFontsLoaded = requiredFonts.every(font => pdfMake.vfs[font]);

      if (allFontsLoaded) {
        pdfMake.fonts = {
          ...(pdfMake.fonts || {}),
          TimesNewRoman: {
            normal: 'TimesNewRoman.ttf',
            bold: 'TimesNewRomanBold.ttf',
            italics: 'TimesNewRomanItalic.ttf',
            bolditalics: 'TimesNewRomanBoldItalic.ttf',
          },
        };
        _timesNewRomanLoaded = true;
      } else {
        console.warn('Không thể load đầy đủ font TimesNewRoman, một số font có thể không khả dụng');
        // Không set _timesNewRomanLoaded = true để có thể thử lại lần sau
      }
    } else {
      console.warn('Không thể load bất kỳ font TimesNewRoman nào, sẽ sử dụng font mặc định');
    }
  } catch (error) {
    console.error('Lỗi khi load font TimesNewRoman:', error);
    // Không throw error, để ứng dụng tiếp tục với font mặc định
  }
};

export const createHeaderBlock = dataCompany => ({
  columns: [
    {
      width: '*',
      stack: [
        {
          image: 'logo',
          width: 90,
          height: 50,
          alignment: 'left',
          fit: [90, 50],
          margin: [0, 2, 0, 6],
        },
        { text: `${dataCompany?.company_name || ''}`, style: 'pwCompanyName' },
        {
          text: [
            dataCompany?.company_phone_number ? `${dataCompany?.company_phone_number}` : '',
            dataCompany?.company_phone_number && dataCompany?.company_address ? '  •  ' : '',
            dataCompany?.company_address ? `${dataCompany?.company_address}` : '',
          ].join(''),
          style: 'pwCompanyMeta',
        },
      ],
    },
  ],
  columnGap: 10,
});

export const createFooter = PRIMARY => (currentPage, pageCount) => {
  const now = moment().format('DD/MM/YYYY HH:mm:ss');
  return {
    columns: [
      {
        text: 'FMRP - Quản Lý Xưởng Online',
        alignment: 'left',
        margin: [40, 0, 0, 10],
        fontSize: 8,
        color: PRIMARY,
      },
      {
        text: now,
        alignment: 'right',
        margin: [0, 0, 40, 10],
        fontSize: 8,
        color: PRIMARY,
      },
    ],
  };
};

export const applyCommonStyles = (docDefinition, TEXT, SUBTEXT) => {
  docDefinition.styles = {
    ...styles,
    pwCompanyName: { fontSize: 12, bold: true, color: TEXT, margin: [0, 0, 0, 2] },
    pwCompanyMeta: { fontSize: 9, color: SUBTEXT, margin: [0, 0, 0, 1] },
    pwTitle: { fontSize: 16, bold: true, color: TEXT, letterSpacing: 0.3 },
    pwMetaLabel: { fontSize: 9, italics: true, color: SUBTEXT },
    pwMetaValue: { fontSize: 9, italics: true, bold: true, color: TEXT },
    pwInfoLabel: { fontSize: 10, bold: true, color: TEXT },
    pwInfoValue: { fontSize: 10, color: TEXT },
  };
  return docDefinition;
};

const TRANSPARENT_PNG_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z6a8AAAAASUVORK5CYII=';

const urlToDataUrl = async url => {
  try {
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();

    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Không thể tải logo để nhúng PDF, sử dụng ảnh rỗng thay thế:', error);
    return null;
  }
};

const normalizePdfImages = async docDefinition => {
  if (!docDefinition?.images || typeof window === 'undefined') return;

  const entries = Object.entries(docDefinition.images);
  const normalizedEntries = await Promise.all(
    entries.map(async ([key, value]) => {
      if (typeof value === 'string') return [key, value];

      if (value && typeof value === 'object' && value.url) {
        const dataUrl = await urlToDataUrl(value.url);
        return [key, dataUrl || TRANSPARENT_PNG_BASE64];
      }

      return [key, value];
    })
  );

  docDefinition.images = Object.fromEntries(normalizedEntries);
};

export const openPdf = docDefinition => {
  normalizePdfImages(docDefinition)
    .then(() => {
      const pdfGenerator = pdfMake.createPdf(docDefinition);
      pdfGenerator.open();
    })
    .catch(error => {
      console.error('Lỗi khi chuẩn hoá ảnh PDF:', error);
      const safeDocDefinition = {
        ...docDefinition,
        images: {
          ...(docDefinition?.images || {}),
          logo: docDefinition?.images?.logo || TRANSPARENT_PNG_BASE64,
        },
      };
      const pdfGenerator = pdfMake.createPdf(safeDocDefinition);
      pdfGenerator.open();
    });
};


