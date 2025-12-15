import { _ServerInstance as axiosCustom } from "@/services/axios";

/**
 * @typedef {Object} GetQcErrorDetailsPayload
 * @property {string} [search] - Từ khóa tìm kiếm lỗi QC
 * @property {string|number} item_id - ID sản phẩm
 * @property {string|number} item_variation_id - ID biến thể sản phẩm
 */
 
/**
 * @typedef {Object} QcErrorDetail
 * @property {string} id - ID dòng lỗi
 * @property {string} category_qc_error_id - ID nhóm lỗi QC
 * @property {string} code - Mã lỗi
 * @property {string} name - Tên lỗi
 * @property {string} note - Ghi chú
 */

/**
 * @typedef {Object} GetQcErrorDetailsResponse
 * @property {number} isSuccess - 1 nếu thành công, 0 nếu thất bại
 * @property {string} message - Thông báo
 * @property {string} branch_name - Tên chi nhánh (có thể rỗng)
 * @property {QcErrorDetail[]} data - Danh sách lỗi QC
 */
 
const apiQcErrorDetails = {
  /**
   * Lấy danh sách lỗi QC theo sản phẩm/biến thể
   * @description Gọi API lấy chi tiết lỗi QC kèm tìm kiếm
   * @param {GetQcErrorDetailsPayload} payload - Dữ liệu gửi kèm
   * @returns {Promise<GetQcErrorDetailsResponse>} Promise kết quả API
   * @throws {Error} Nếu gọi API thất bại
   */
  async apiGetQcErrorDetails(payload) {
    const { item_id, item_variation_id, search = "" } = payload || {};

    const formData = new FormData();
    formData.append("search", search);

    const response = await axiosCustom(
      "POST",
      `/api_web/api_Qc_error_details/GetQcErrorDetails?csrf_protection=true&item_id=${item_id}&item_variation_id=${item_variation_id}`,
      formData
    );
    return response.data;
  },
};

export default apiQcErrorDetails;

