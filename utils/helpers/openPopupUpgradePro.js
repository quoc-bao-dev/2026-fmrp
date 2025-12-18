/**
 * Action helper để mở popup nâng cấp gói pro
 * @param {Function} dispatch - Redux dispatch function
 * @returns {void}
 */
export const openPopupUpgradePro = (dispatch) => {
  dispatch({
    type: 'statePopupUpgradePro',
    payload: {
      open: true,
    },
  });
};

/**
 * Action helper để đóng popup nâng cấp gói pro
 * @param {Function} dispatch - Redux dispatch function
 * @returns {void}
 */
export const closePopupUpgradePro = (dispatch) => {
  dispatch({
    type: 'statePopupUpgradePro',
    payload: {
      open: false,
    },
  });
};

