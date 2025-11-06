import { Lightbox } from "react-modal-image";
import { useDispatch, useSelector } from "react-redux";
import Popup from "../popup";

const ImagesModal = () => {
    const dispatch = useDispatch();

    const statePopupPreviewImage = useSelector((state) => state?.statePopupPreviewImage);

    const images = statePopupPreviewImage.data?.images

    const nameAlt = statePopupPreviewImage.data?.nameAlt || ''

    return (
        <Popup open={statePopupPreviewImage.open} classNameModeltime='!bg-transparent'>
            <div className="relative z-[9999] w-[98vw] h-screen">
                <Lightbox
                    medium={images ? images : "/icon/noimagelogo.png"}
                    large={images ? images : "/icon/noimagelogo.png"}
                    alt={nameAlt}
                    onClose={() => dispatch({ type: "statePopupPreviewImage", payload: { open: false } })}
                />
            </div>
        </Popup>
    );
};

export default ImagesModal;
