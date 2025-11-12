// [login-socket] [step 1] Import các dependencies cần thiết
import React, { createContext, useContext } from 'react';
import { useLoginSocketWithToken } from '@/hooks/socket/useLoginSocketWithToken';

// [login-socket] [step 2] Tạo Context với default value
const LoginSocketContext = createContext({
  socket: null,
  loading: true,
  error: null,
});

/**
 * Provider component cho Login Socket
 * @param {Object} props
 * @param {React.ReactNode} props.children - Children components
 * @param {Object} props.payload - Payload chứa thông tin kết nối socket
 * @param {string} props.payload.user_id - ID người dùng (placeholder)
 * @param {string} props.payload.db_name - Tên database (placeholder)
 * @param {string} props.payload.user_name - Tên người dùng (placeholder)
 * @param {string} props.payload.socket_url - URL socket server
 */
export const LoginSocketProvider = ({ children, payload }) => {
  // [login-socket] [step 3] Sử dụng hook useLoginSocketWithToken với payload
  const { socket, loading, error } = useLoginSocketWithToken(payload);

  // [login-socket] [step 4] Wrap children với Context.Provider và truyền socket, loading, error
  return <LoginSocketContext.Provider value={{ socket, loading, error }}>{children}</LoginSocketContext.Provider>;
};

// [login-socket] [step 5] Export hook để sử dụng trong component con
export const useLoginSocketContext = () => useContext(LoginSocketContext);
