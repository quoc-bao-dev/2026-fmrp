import PopupCustom from '@/components/UI/popup';
import ExcelIcon from '@/components/icons/common/Excel';
import useToast from '@/hooks/useToast';
import { useGetDateExcel } from '@/managers/api/inventory/useGetDateExcel';
import { useImportDateExcel } from '@/managers/api/inventory/useImportDateExcel';
import { handleDownloadExcelTemplate } from '@/utils/helpers/excelHelper';
import { DocumentDownload } from 'iconsax-react';
import React, { useRef, useState } from 'react';

const PopupImportExcel = React.memo(props => {
  const isShow = useToast();
  const fileInputRef = useRef(null);
  const [open, sOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importError, setImportError] = useState(null);

  const { data: dataDateExcel, isLoading: isLoadingDateExcel, refetch: refetchDateExcel } = useGetDateExcel();

  const _HandleClose = () => {
    setSelectedFile(null);
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    sOpen(false);
  };

  const { importDateExcel, isLoading: isLoadingImport } = useImportDateExcel({
    onSuccess: data => {
      // [Import] [step 5] Đẩy response (kèm dữ liệu hợp lệ) về form để xử lý & hiển thị
      if (typeof props.onImportResult === 'function') {
        props.onImportResult({
          message: data?.message,
          errors: data?.errors,
          data: data?.data,
          total_errors: data?.total_errors,
        });
      } else if (data?.data && props.sDataChoose) {
        props.sDataChoose(data.data);
      }

      // Close popup after successful import
      _HandleClose();
    },
    onError: error => {
      console.error('Import error:', error);
      const message = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi nhập file. Vui lòng kiểm tra lại.';
      setImportError(message);
    },
  });

  const _TogglePopup = e => sOpen(e);

  const _CheckWareHouse = () => {
    if (props.warehouse !== null) {
      sOpen(true);
    } else {
      isShow('error', 'Vui lòng chọn kho hàng');
      props.sErrWareHouse(true);
    }
  };

  const _HandleDownloadTemplate = async () => {
    try {
      // Lấy dữ liệu từ API
      const result = await refetchDateExcel();
      const data = result?.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        isShow('error', 'Không có dữ liệu để tạo template');
        return;
      }

      // Sử dụng helper function để tạo và download Excel template
      handleDownloadExcelTemplate(data, {
        title: 'File mẫu nhập Excel kiểm kê',
        sheetName: 'Template',
        columnWidth: 20,
        showHeader: false,
      });

      isShow('success', 'Đã tải file mẫu thành công');
    } catch (error) {
      console.error('Error downloading template:', error);
      isShow('error', 'Có lỗi xảy ra khi tải file mẫu');
    }
  };

  const _HandleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImportError(null);
      // Validate file type
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        isShow('error', 'Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        e.target.value = '';
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        isShow('error', 'File không được vượt quá 10MB');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      isShow('success', `Đã chọn file: ${file.name}`);
    }
  };

  const _HandleImport = () => {
    // Validate file
    if (!selectedFile) {
      isShow('error', 'Vui lòng chọn file Excel để nhập');
      return;
    }

    // Validate warehouse
    if (!props.warehouse || !props.warehouse.value) {
      isShow('error', 'Vui lòng chọn kho hàng');
      props.sErrWareHouse(true);
      return;
    }

    // Create FormData with file_excel and warehouse_id
    const formData = new FormData();
    formData.append('file_excel', selectedFile);
    formData.append('warehouse_id', props.warehouse.value);

    // Call import API
    if (typeof props.onImportResult === 'function') {
      // [Import] [step 6] Reset banner lỗi trên form trước khi gửi request mới
      props.onImportResult(null);
    }
    setImportError(null);
    importDateExcel(formData);
  };

  return (
    <>
      <button onClick={_CheckWareHouse} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded border border-background-blue-2 transition'>
        <ExcelIcon className='3xl:size-5 size-4 text-blue-fmrp' />
        <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>Kiểm kê bằng excel</span>
      </button>
      <PopupCustom title={'Nhập excel để kiểm kê mặt hàng'} open={open} onClose={_HandleClose}>
        <div className='py-4 w-[600px] 2xl:space-y-5 space-y-4'>
          {/* Middle section with 2 buttons */}

          <div className='flex items-center justify-center gap-4 py-4'>
            <div className='relative flex flex-col items-center'>
              <input ref={fileInputRef} type='file' accept='.xlsx,.xls' onChange={_HandleFileChange} className='hidden' id='excel-file-input' />
              <label
                htmlFor='excel-file-input'
                className='xl:text-sm text-xs xl:px-5 px-3 xl:py-2.5 py-1.5 bg-gradient-to-l from-[#0F4F9E] via-[#0F4F9E] via-[#296dc1] to-[#0F4F9E] text-white rounded btn-animation hover:scale-105 outline-none whitespace-pre cursor-pointer flex items-center space-x-2'
              >
                <ExcelIcon className='size-4' />
                <span>Chọn file Excel</span>
              </label>
            </div>
            <button
              onClick={_HandleDownloadTemplate}
              className='xl:text-sm text-xs xl:px-5 px-3 xl:py-2.5 py-1.5 bg-white border border-background-blue-2 text-blue-fmrp rounded hover:bg-primary-07 transition flex items-center space-x-2'
            >
              <DocumentDownload className='size-4' />
              <span>Tải file mẫu</span>
            </button>
          </div>
          <div className='mt-2 text-sm text-gray-600 text-center w-full'>
            <span className='font-medium'>{selectedFile ? 'File đã chọn:' : 'Chưa chọn file'}</span> {selectedFile && <span className='break-all'>{selectedFile.name}</span>}
          </div>
          {/* Vị trí render thông báo lỗi import dưới dòng hiển thị tên file */}
          {importError && <div className='mt-2 w-full text-center bg-red-50 border border-red-300 text-red-700 rounded px-3 py-2 break-words'>{importError}</div>}

          {/* Bottom section with 2 buttons */}
          <div className='flex justify-end space-x-2 pt-4 border-t'>
            <button
              onClick={_HandleClose}
              disabled={isLoadingImport}
              className='px-4 py-2 text-base transition rounded-lg bg-slate-200 hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {props.dataLang?.branch_popup_exit || 'Thoát'}
            </button>
            <button
              onClick={_HandleImport}
              disabled={isLoadingImport || !selectedFile}
              className='text-[#FFFFFF] text-base py-2 px-4 rounded-lg bg-[#003DA0] hover:opacity-90 hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoadingImport ? 'Đang nhập...' : 'Nhập'}
            </button>
          </div>
        </div>
      </PopupCustom>
    </>
  );
});

export default PopupImportExcel;
