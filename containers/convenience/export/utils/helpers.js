/**
 * Parse và set data từ template
 * @param {Object} parsedValue - Giá trị đã parse từ JSON
 * @param {Number} tabPage - Tab hiện tại
 * @returns {Object} Object chứa các array fields tương ứng
 */
export const parseTemplateData = (parsedValue, tabPage) => {
  if (tabPage == 1) {
    return {
      clients: parsedValue?.clients?.map(e => JSON.parse(e)) || [],
      contacts: parsedValue?.contacts?.map(e => JSON.parse(e)) || [],
      address: parsedValue?.address?.map(e => JSON.parse(e)) || [],
    };
  } else if (tabPage == 2) {
    return {
      suppliers: parsedValue?.suppliers?.map(e => JSON.parse(e)) || [],
      contacts: parsedValue?.contacts?.map(e => JSON.parse(e)) || [],
    };
  } else if (tabPage == 3) {
    return {
      materials: parsedValue?.materials?.map(e => JSON.parse(e)) || [],
    };
  } else if (tabPage == 4) {
    return {
      products: parsedValue?.products?.map(e => JSON.parse(e)) || [],
    };
  }
  return {};
};

/**
 * Merge arrEmtyLength vào dataColumnNew
 * @param {Object} dataColumnNew - Data column mới
 * @param {Object} arrEmtyLength - Array empty length
 * @returns {Object} Data column đã merge
 */
export const mergeDataColumn = (dataColumnNew, arrEmtyLength) => {
  const newDataColumnNew = { ...dataColumnNew };
  for (const key in arrEmtyLength) {
    if (newDataColumnNew[key]) {
      newDataColumnNew[key] = [...newDataColumnNew[key], ...arrEmtyLength[key]];
    }
  }
  return newDataColumnNew;
};

/**
 * Check và filter các value đã có trong arrEmty
 * @param {Object} dataColumnNew - Data column mới
 * @param {Object} arrEmty - Array empty
 */
export const filterSelectedValues = (dataColumnNew, arrEmty) => {
  const result = { ...dataColumnNew };
  for (const key in result) {
    if (result[key] && arrEmty[key]) {
      const selectedValues = {};
      arrEmty[key].forEach(item => {
        selectedValues[item.value] = true;
      });
      result[key] = result[key].filter(item => !selectedValues[item.value]);
    }
  }
  return result;
};

/**
 * Transform data cho Excel - Xử lý quan hệ 1-nhiều
 */
export const transformDataForExcel = (dataServer, arrEmty, tabPage, dataLang) => {
  const fieldMapping = {
    1: [...arrEmty.clients, ...arrEmty.contacts, ...arrEmty.address],
    2: [...arrEmty.suppliers, ...arrEmty.contacts],
    3: [...arrEmty.materials],
    4: [...arrEmty.products],
  };

  const allFields = fieldMapping[tabPage] || [];

  const checkValue = (e, contacts, arrAddress) => {
    if (contacts && (contacts?.length > arrAddress?.length || contacts?.length == arrAddress?.length)) {
      return contacts?.map((contact, index) => ({
        ...e,
        ...contact,
        ...(arrAddress ? arrAddress[index] : {}),
      }));
    } else if (arrAddress) {
      return arrAddress?.map((address, index) => ({
        ...e,
        ...address,
        ...(contacts ? contacts[index] : {}),
      }));
    }
    return [e];
  };

  const checkValueSupplier = (e, contacts) => {
    if (contacts && contacts.length > 0) {
      return contacts?.map(contact => ({ ...e, ...contact }));
    }
    return [e];
  };

  const dataCustom = dataServer
    .map(e => {
      if (tabPage == 1) {
        return checkValue(e, e.contacts, e.arrAddress);
      } else if (tabPage == 2) {
        return checkValueSupplier(e, e.contacts);
      }
      return [e];
    })
    .flat();

  const values = dataCustom.map(item => allFields?.map(field => item[field?.value] || ''));

  const columns = allFields?.map(header => ({
    title: `${dataLang[header.label] || header.label}`,
  }));

  return { values, columns };
};

