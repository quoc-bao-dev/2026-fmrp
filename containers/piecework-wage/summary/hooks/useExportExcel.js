import apiSummary from '@/Api/apiPieceworkWage/sunmary/apiSummary';
import { formatSecondsToHours } from '@/utils/helpers/formatSecondsToHours';
import moment from 'moment';
import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx-js-style';

const isSuccessResponse = (res) =>
  res &&
  (res.isSuccess === 1 ||
    res.isSuccess === '1' ||
    res.isSuccess === true);

export const useExportExcel = ({ commonQueryParams, excelFileName, showToast }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportExcel = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const exportParams = { ...commonQueryParams, is_excel: 1 };

      const [resSummary, resDetail] = await Promise.all([
        apiSummary.apiSummary(exportParams),
        apiSummary.apiSummaryDetail(exportParams),
      ]);

      if (!isSuccessResponse(resSummary) || !isSuccessResponse(resDetail)) {
        const message =
          resSummary?.message ||
          resDetail?.message ||
          'Xuất excel thất bại, vui lòng thử lại';
        showToast?.('error', message);
        return;
      }

      const aggregateRows = resSummary?.data?.aggregate ?? resSummary?.aggregate ?? [];
      const detailRows = resDetail?.data?.items ?? resDetail?.items ?? [];

      // Sheet 1: Tổng hợp
      const summaryHeader = [
        'STT',
        'Công nhân',
        'Nhóm',
        'Số lượng (cái)',
        'Giờ làm',
        'Tổng lương (VNĐ)',
        'Công đoạn',
      ];
      const summaryDataRows = (Array.isArray(aggregateRows) ? aggregateRows : []).map((row, idx) => ([
        idx + 1,
        row?.staff?.full_name || '-',
        (row?.groups ?? []).map(g => g?.name).filter(Boolean).join(', ') || '-',
        Number(row?.total_produced) || 0,
        formatSecondsToHours(row?.total_time) || '-',
        Number(row?.total_amount) || 0,
        (row?.stages ?? []).map(s => s?.name).filter(Boolean).join(', ') || '-',
      ]));

      const totalProduced = summaryDataRows.reduce((sum, r) => sum + (Number(r?.[3]) || 0), 0);
      const totalAmount = summaryDataRows.reduce((sum, r) => sum + (Number(r?.[5]) || 0), 0);
      const totalSeconds = (Array.isArray(aggregateRows) ? aggregateRows : []).reduce((sum, r) => sum + (Number(r?.total_time) || 0), 0);

      const summaryTotalRow = [
        '',
        'Tổng',
        '',
        totalProduced,
        totalSeconds ? formatSecondsToHours(totalSeconds) : '-',
        totalAmount,
        '',
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryDataRows, summaryTotalRow]);
      wsSummary['!cols'] = [
        { wch: 6 },
        { wch: 25 },
        { wch: 28 },
        { wch: 15 },
        { wch: 14 },
        { wch: 18 },
        { wch: 40 },
      ];

      // Style header + number formats
      for (let c = 0; c < summaryHeader.length; c++) {
        const ref = XLSX.utils.encode_cell({ r: 0, c });
        if (wsSummary[ref]) wsSummary[ref].s = { font: { bold: true } };
      }
      const summaryNumberCols = [3, 5]; // produced, amount
      for (let r = 1; r < 1 + summaryDataRows.length + 1; r++) {
        for (const c of summaryNumberCols) {
          const ref = XLSX.utils.encode_cell({ r, c });
          if (wsSummary[ref]) wsSummary[ref].s = { ...(wsSummary[ref].s || {}), numFmt: '#,##0' };
        }
      }
      // Bold total row
      const summaryTotalRowIdx = 1 + summaryDataRows.length;
      for (let c = 0; c < summaryHeader.length; c++) {
        const ref = XLSX.utils.encode_cell({ r: summaryTotalRowIdx, c });
        if (wsSummary[ref]) wsSummary[ref].s = { ...(wsSummary[ref].s || {}), font: { bold: true } };
      }

      // Sheet 2: Chi tiết
      const detailHeader = [
        'STT',
        'Ngày',
        'Công nhân',
        'Công đoạn',
        'Giờ làm',
        'Sản phẩm',
        'Biến thể',
        'Mã SP',
        'Mã lệnh',
        'Đơn giá',
        'Số lượng',
        'Thành tiền',
      ];
      const detailDataRows = (Array.isArray(detailRows) ? detailRows : []).map((row, idx) => ([
        idx + 1,
        row?.date ? moment(row.date).format('DD/MM/YYYY') : '-',
        row?.staff?.full_name || '-',
        row?.stage_name || '-',
        formatSecondsToHours(row?.total_time) || '-',
        row?.item?.item_name || '-',
        row?.item?.variation || '-',
        row?.item?.item_code || '-',
        row?.reference_no_detail || '-',
        Number(row?.price_salary) || 0,
        Number(row?.total_quantity) || 0,
        Number(row?.total_amount) || 0,
      ]));

      const totalDetailSeconds = (Array.isArray(detailRows) ? detailRows : []).reduce((sum, r) => sum + (Number(r?.total_time) || 0), 0);
      const totalDetailQty = detailDataRows.reduce((sum, r) => sum + (Number(r?.[10]) || 0), 0);
      const totalDetailAmount = detailDataRows.reduce((sum, r) => sum + (Number(r?.[11]) || 0), 0);

      const detailTotalRow = [
        '',
        'Tổng',
        '',
        '',
        totalDetailSeconds ? formatSecondsToHours(totalDetailSeconds) : '-',
        '',
        '',
        '',
        '',
        '',
        totalDetailQty,
        totalDetailAmount,
      ];

      const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailDataRows, detailTotalRow]);
      wsDetail['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 25 },
        { wch: 26 },
        { wch: 14 },
        { wch: 30 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 14 },
        { wch: 12 },
        { wch: 14 },
      ];

      for (let c = 0; c < detailHeader.length; c++) {
        const ref = XLSX.utils.encode_cell({ r: 0, c });
        if (wsDetail[ref]) wsDetail[ref].s = { font: { bold: true } };
      }
      const detailNumberCols = [9, 10, 11]; // price, qty, amount
      for (let r = 1; r < 1 + detailDataRows.length + 1; r++) {
        for (const c of detailNumberCols) {
          const ref = XLSX.utils.encode_cell({ r, c });
          if (wsDetail[ref]) wsDetail[ref].s = { ...(wsDetail[ref].s || {}), numFmt: '#,##0' };
        }
      }
      const detailTotalRowIdx = 1 + detailDataRows.length;
      for (let c = 0; c < detailHeader.length; c++) {
        const ref = XLSX.utils.encode_cell({ r: detailTotalRowIdx, c });
        if (wsDetail[ref]) wsDetail[ref].s = { ...(wsDetail[ref].s || {}), font: { bold: true } };
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp');
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi tiết');
      XLSX.writeFile(wb, `${excelFileName}.xlsx`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Xuất excel thất bại, vui lòng thử lại';
      showToast?.('error', message);
    } finally {
      setIsExporting(false);
    }
  }, [commonQueryParams, excelFileName, isExporting, showToast]);

  return { isExporting, exportExcel };
};


