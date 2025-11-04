import apiExport from '@/Api/apiConvenience/apiExport';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import { useQuery } from '@tanstack/react-query';
import { _ServerInstance as Axios } from '/services/axios';

export const useFetchDataSupplierFields = (enabled = true) => {
  const fetchDataSupplierFields = async () => {
    const response = await apiExport.apiExportSupplierFields();
    return response.data;
  };
  return useQuery({
    queryKey: ['export_data_supplier_fields'],
    queryFn: fetchDataSupplierFields,
    enabled,
  });
};

export const useFetchDataMaterialsFields = (enabled = true) => {
  const fetchDataMaterialsFields = async () => {
    const response = await apiExport.apiExportMaterialsFields();
    return response.data;
  };
  return useQuery({
    queryKey: ['export_data_materials_fields'],
    queryFn: fetchDataMaterialsFields,
    enabled,
  });
};

export const useFetchDataProductsFields = (enabled = true) => {
  const fetchDataProductsFields = async () => {
    const response = await apiExport.apiExportProductsFields();
    return response.data;
  };
  return useQuery({
    queryKey: ['export_data_products_fields'],
    queryFn: fetchDataProductsFields,
    enabled,
  });
};

/**
 * Hook để fetch data columns theo tab
 */
export const useFetchDataColumn = (tabPage, enabled = false) => {
  // Chỉ hỗ trợ Tab 1 (Khách hàng)
  const isTab1 = String(tabPage) === '1';
  const apiUrl = isTab1 ? '/api_web/api_export_data/get_field_client?csrf_protection=true' : '';

  return useQuery({
    queryKey: ['export_data_column', isTab1 ? 1 : 'disabled'],
    queryFn: () => {
      return new Promise((resolve, reject) => {
        Axios('GET', apiUrl, {}, (err, response) => {
          if (err) reject(err);
          else {
            const arrData = response.data;
            resolve(arrData);
          }
        });
      });
    },
    enabled: enabled && isTab1 && !!apiUrl,
  });
};

/**
 * Hook để fetch templates
 */
export const useFetchDataTemplate = (tabPage, enabled = false) => {
  const apiDataTempalte = {
    1: '/api_web/api_export_data/get_template_export?csrf_protection=true',
    2: '/api_web/api_export_data/get_template_export?csrf_protection=true',
    3: '/api_web/api_export_data/get_template_export?csrf_protection=true',
    4: '/api_web/api_export_data/get_template_export?csrf_protection=true',
  };
  const apiUrl = apiDataTempalte[tabPage] || '';

  return useQuery({
    queryKey: ['export_data_template', tabPage],
    queryFn: () => {
      return new Promise((resolve, reject) => {
        Axios('GET', apiUrl, { params: { tab: tabPage } }, (err, response) => {
          if (err) reject(err);
          else {
            const db = response.data;
            if (Array.isArray(db)) {
              const data = db?.map(e => ({
                label: e?.code,
                value: e?.id,
                date: formatMoment(e?.date_create, FORMAT_MOMENT.DATE_SLASH_LONG),
                setup_colums: e?.setup_colums,
              }));
              resolve(data);
            } else {
              resolve([]);
            }
          }
        });
      });
    },
    enabled: enabled && !!tabPage && !!apiUrl,
  });
};
