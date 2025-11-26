import { Lexend_Deca } from "@next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Popup from "reactjs-popup";

const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const PopupGlobal = ({ ...props }) => {
  const dispatch = useDispatch();
  // State riêng để điều khiển hiển thị Popup và Animation
  const [showPopup, setShowPopup] = useState(false);

  const statePopupGlobal = useSelector((state) => state.statePopupGlobal);

  useEffect(() => {
    if (statePopupGlobal.open) {
      setShowPopup(true);
    }
  }, [statePopupGlobal.open]);

  const handleClose = () => {
    dispatch({
      type: "statePopupGlobal",
      payload: { open: false },
    });
  };

  const handleAnimationComplete = () => {
    if (!statePopupGlobal.open) {
      setShowPopup(false);
    }
  };

  return (
    <Popup
      modPopupal
      open={showPopup}
      closeOnDocumentClick={statePopupGlobal.allowOutsideClick ?? false} // ❌ Ngăn click ra ngoài
      closeOnEscape={statePopupGlobal.allowEscape ?? false} // ❌ Ngăn nhấn ESC để đóng
      onClose={handleClose}
      className={`${props.className} border-gradient`}
      overlayStyle={{
        background: "#25387A50",
        zIndex: 1000,
        backdropFilter: "blur(2.5px)", // Hiệu ứng blur cho nền overlay
        WebkitBackdropFilter: "blur(2.5px)", // Hỗ trợ cho trình duyệt Webkit (Safari)
      }}
    >
      <AnimatePresence mode="wait">
        {statePopupGlobal.open && (
          <motion.div
            key="popup-animation"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${deca.className} border-gradient`}
            onAnimationComplete={handleAnimationComplete}
          >
            {statePopupGlobal.children}
          </motion.div>
        )}
      </AnimatePresence>
    </Popup>
  );
};

export default PopupGlobal;
