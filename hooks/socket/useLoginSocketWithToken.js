import { useEffect, useRef, useState } from 'react';
import useSocket from './useSocket'; // [login-socket] [step 1] Import hook base useSocket

/**
 * Hook kết nối socket cho login page với token authentication
 * @param {Object} payload - Payload chứa thông tin kết nối
 * @param {string} payload.user_id - ID người dùng (placeholder)
 * @param {string} payload.db_name - Tên database (placeholder)
 * @param {string} payload.user_name - Tên người dùng (placeholder)
 * @param {string} payload.socket_url - URL socket server (lấy từ dataSetting?.socket_link_connect)
 * @returns {Object} { socket, loading, error }
 */
export const useLoginSocketWithToken = payload => {
  // [login-socket] [step 2] Khởi tạo state: token, loading, error
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false); // [login-socket] [step 3] Đảm bảo chỉ fetch token 1 lần

  // [login-socket] [step 4] Fetch token từ API /add-user khi có đủ payload
  useEffect(() => {
    // [login-socket] [step 5] Chặn chạy khi chưa có đủ thông tin cần thiết
    if (hasFetched.current || !payload?.user_id || !payload?.db_name || !payload?.user_name || !payload?.socket_url) return;

    hasFetched.current = true;

    const init = async () => {
      setLoading(true);

      // [login-socket] [step 6] Chuẩn bị payload để gửi lên server
      const dataSubmit = {
        user_id: payload.user_id,
        db_name: payload.db_name,
        user_name: payload.user_name,
      };

      try {
        // [login-socket] [step 7] Gọi API /add-user để lấy token
        const res = await fetch(`${payload.socket_url}/add-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataSubmit),
        });

        const result = await res.json();

        const token = result?.token;

        // [login-socket] [step 8] Lưu token nếu có, hoặc set error nếu không có
        if (token) {
          setToken(token);
        } else {
          setError('Không có token từ server');
        }
      } catch (err) {
        console.error('Login socket init error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [payload]);

  // [login-socket] [step 9] Kết nối socket với token trong header (chỉ khi có token và socket_url)
  const shouldConnect = !!token && !!payload?.socket_url;

  const socket = useSocket(
    payload?.socket_url,
    {
      extraHeaders: {
        auth: token,
      },
    },
    shouldConnect
  );

  // [login-socket] [step 10] Emit connectedData khi socket kết nối thành công
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('🔌 Login socket connected:', socket.id);
      // [login-socket] [step 11] Gửi thông tin kết nối lên server
      socket.emit('connectedData', {
        user_id: payload?.user_id,
        db_name: payload?.db_name,
        user_name: payload?.user_name,
      });
    };

    // [login-socket] [step 12] Lắng nghe sự kiện connect và connect_error
    socket.on('connect', handleConnect);
    socket.on('connect_error', err => {
      console.error('Login socket connection error:', err?.message, err?.data);
    });

    // [login-socket] [step 13] Nếu socket đã connected sẵn, gọi handleConnect ngay
    if (socket.connected) {
      handleConnect();
    }

    // [login-socket] [step 14] Cleanup: remove listeners khi unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error');
    };
  }, [socket, payload]);

  // [login-socket] [step 15] Return socket, loading, error để component sử dụng
  return { socket, loading, error };
};
