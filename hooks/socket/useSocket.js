import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket as ClientSocket } from "socket.io-client";

const useSocket = (url, options = {}, shouldConnect = true) => {
    const [socket, setSocket] = useState(null);

    // Đảm bảo `options` không thay đổi
    const stableOptions = useMemo(() => options, [JSON.stringify(options)]);


    useEffect(() => {
        // ⛔ Không kết nối nếu chưa đủ điều kiện
        if (!shouldConnect || !url) return;

        const socketInstance = io(url, stableOptions);
        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
            setSocket(null); // thêm dòng này để tránh giữ socket cũ
        };
    }, [url, stableOptions, shouldConnect]);


    return socket;
};

export default useSocket;
