import { useSelector } from 'react-redux';

const PARCEL_USE = {
    'luong-san-luong': 'production_output',
    'gia-cong-ngoai': 'production_output_buy',
};

/**
 * Hook kiểm tra module đã cài đặt hay chưa và đã được giới thiệu hay chưa
 * @returns {Object} Object chứa hàm checkInstall và checkIntroduce
 */
export const useCheckModuleInstall = () => {
    const authState = useSelector(state => state.auth);
    const parcelUse = authState?.parcel_use?.map(item => item.key_menu_fe) || [];

    /**
     * Kiểm tra module đã cài đặt hay chưa
     * @param {string|string[]} keys - Key hoặc mảng keys từ PARCEL_USE object
     * @returns {boolean} true nếu module đã cài đặt, false nếu chưa
     */
    const checkInstall = (keys) => {
        if (!keys) return false;

        // Nếu là mảng, kiểm tra xem có ít nhất 1 module được cài đặt không
        if (Array.isArray(keys)) {
            return keys.some(key => {
                const moduleKey = PARCEL_USE[key];
                return moduleKey && parcelUse.includes(moduleKey);
            });
        }

        // Nếu là string, kiểm tra module tương ứng
        const moduleKey = PARCEL_USE[keys];
        if (!moduleKey) return false;

        return parcelUse.includes(moduleKey);
    };

    /**
     * Kiểm tra module đã được giới thiệu hay chưa
     * @param {string} key - Key từ PARCEL_USE object
     * @returns {boolean} true nếu đã giới thiệu (introduce != "0"), false nếu chưa giới thiệu (introduce == "0")
     */
    const checkIntroduce = (key) => {
        if (!key) return true; // Nếu không có key, mặc định là đã giới thiệu

        const moduleKey = PARCEL_USE[key];
        if (!moduleKey) return true; // Nếu không tìm thấy moduleKey, mặc định là đã giới thiệu

        // Tìm item trong parcel_use có key_menu_fe khớp với moduleKey
        const moduleItem = authState?.parcel_use?.find(item => item.key_menu_fe === moduleKey);

        // Nếu không tìm thấy item, mặc định là đã giới thiệu
        if (!moduleItem) return true;

        // Nếu introduce == "0" thì chưa giới thiệu (trả về false)
        // Nếu introduce != "0" thì đã giới thiệu (trả về true)
        return moduleItem.introduce !== "0";
    };

    return { checkInstall, checkIntroduce };
};
