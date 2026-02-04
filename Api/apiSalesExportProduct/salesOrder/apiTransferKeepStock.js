import { _ServerInstance as axiosCustom } from "@/services/axios";

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 * @property {number} [status] - HTTP status code
 */

/**
 * @typedef {Object} TransferKeepStockItem
 * @property {string} id - Item ID
 * @property {string} item_type - Item type (e.g., "product")
 * @property {string} quantity - Quantity
 * @property {string} quantity_delivery - Quantity delivered
 * @property {string} quantity_condition - Quantity condition
 * @property {string} quantity_plan - Quantity plan
 * @property {string} quantity_had_condition - Quantity had condition
 * @property {Object} item - Item details
 * @property {string} item.id - Item variation ID
 * @property {string} item.item_variation_id - Item variation ID
 * @property {string} item.text_type - Text type (e.g., "products")
 * @property {string} item.code - Item code
 * @property {string} item.name - Item name
 * @property {string} item.product_variation - Product variation
 * @property {string} item.product_variation_1 - Product variation 1
 * @property {string} item.product_variation_2 - Product variation 2
 * @property {string} item.item_name - Item name
 * @property {string} item.images - Item image URL
 * @property {string} item.unit_name - Unit name
 * @property {string} item.price_sell - Selling price
 * @property {string} item.price_import - Import price
 * @property {string} item.qty_warehouse - Warehouse quantity
 * @property {string} item.price - Price
 * @property {string} item.category_id - Category ID
 * @property {Array} item.warehouse_location - Warehouse locations
 * @property {string} item_complex_id - Item complex ID
 */

/**
 * @typedef {Object} TransferKeepStockData
 * @property {string} id - Transfer keep stock ID
 * @property {string} code - Transfer code (e.g., "SO_000178")
 * @property {string} date - Transfer date (e.g., "2026-01-26 16:08:38")
 * @property {string} branch_id - Branch ID
 * @property {string} branch_name - Branch name
 * @property {string} client_id - Client ID
 * @property {string} client_code - Client code
 * @property {string} client_name - Client name
 * @property {string} contact_id - Contact ID
 * @property {string|null} contact_name - Contact name
 * @property {string} note - Note
 * @property {string} staff_id - Staff ID
 * @property {string} staff_name - Staff name
 * @property {string} profile_image - Staff profile image URL
 * @property {string} status - Status (e.g., "approved")
 * @property {string} status_payment - Payment status (e.g., "payment_unpaid")
 * @property {string} total_payment - Total payment
 * @property {string} confirmed_staff_name - Confirmed staff name
 * @property {string} confirmed_staff_image - Confirmed staff image URL
 * @property {string} quote_id - Quote ID
 * @property {string|null} quote_code - Quote code
 * @property {Array<TransferKeepStockItem>} items - List of items
 */

/**
 * @typedef {Object} TransferKeepStockResponse
 * @property {boolean} isSuccess - Success status
 * @property {string} [message] - Response message
 * @property {TransferKeepStockData} [data] - Transfer keep stock data
 */

const apiTransferKeepStock = {
    /**
     * Get Transfer Keep Stock Detail API
     * @description Retrieves detailed information of a transfer keep stock order by ID
     * @param {number|string} id - Transfer keep stock order ID (e.g., 178)
     * @returns {Promise<TransferKeepStockResponse>} Promise that resolves to API response
     * @throws {Error} When API call fails
     * @example
     * // Get transfer keep stock detail
     * const result = await apiTransferKeepStock.apiGetTransferKeepStock(178);
     *
     * // Handle response
     * if (result.isSuccess) {
     *   console.log("Transfer data:", result.data);
     * } else {
     *   console.error("Failed to get transfer:", result.message);
     * }
     */
    async apiGetTransferKeepStock(id) {
        const response = await axiosCustom(
            'GET',
            `/api_web/Api_transfer/transfer/${id}?csrf_protection=true`
        );
        return response.data;
    }
};

export default apiTransferKeepStock;
