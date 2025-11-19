import Swal from "sweetalert2";
import "animate.css";
import SuccessAlertIcon from "@/components/icons/common/SuccessAlertIcon";
import ErrorAlertIcon from "@/components/icons/common/ErrorAlertIcon";
import WarningAlertIcon from "@/components/icons/common/WarningAlertIcon";
import ReactDOMServer from "react-dom/server";

const useToast = () => {
    const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        // timer: 1000,
        // timerProgressBar: true,
        showClass: {
            popup: "animate__zoomIn faster",
        },
        hideClass: {
            popup: "animate__zoomOut faster",
        },
    });

    const showToast = (type, message, time, position = "top") => {
        let iconHtml;
        if (type === "success") {
            iconHtml = ReactDOMServer.renderToStaticMarkup(<SuccessAlertIcon />);
        } else if (type === "warning") {
            iconHtml = ReactDOMServer.renderToStaticMarkup(<WarningAlertIcon />);
        } else {
            iconHtml = ReactDOMServer.renderToStaticMarkup(<ErrorAlertIcon />);
        }

        Toast.fire({
            icon: type,
            position: position,
            title: message,
            timer: time || 3000,
            iconHtml: iconHtml,
            customClass: {
                popup: `custom-toast-popup custom-toast-popup-${type}`,
                title: `custom-toast-title-${type} custom-toast-title`,
                icon: "custom-toast-icon",
                closeButton: `custom-toast-close-button-${type} custom-toast-close-button`
            },
            showCloseButton: true,
        });
    };

    return showToast;
};

export default useToast;
