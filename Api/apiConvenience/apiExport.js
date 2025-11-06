import { _ServerInstance as axiosCustom } from '@/services/axios';

const apiExport = {
  async apiExportSupplierFields(data) {
    const response = await axiosCustom('GET', `/api_web/export/supplier-fields`, { data });
    return response.data;
  },

  async apiExportSuppliers(data) {
    const response = await axiosCustom('POST', `/api_web/export/suppliers?csrf_protection=true`, { data });
    return response.data;
  },

  async apiExportMaterialsFields() {
    const response = await axiosCustom('GET', `/api_web/export/material-fields`);
    return response.data;
  },

  async apiExportMaterials(data) {
    const response = await axiosCustom('POST', `/api_web/export/materials`, { data });
    return response.data;
  },

  async apiExportProductsFields() {
    const response = await axiosCustom('GET', `/api_web/export/product-fields`);
    return response.data;
  },

  async apiExportProducts(data) {
    const response = await axiosCustom('POST', `/api_web/export/products`, { data });
    return response.data;
  },
};

export default apiExport;
