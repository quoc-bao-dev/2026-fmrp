# Kế hoạch triển khai LoginSocketProvider

## 📋 Tổng quan

Tạo một Socket Provider riêng biệt cho trang login (`LoginSocketProvider`) với hook tương ứng (`useLoginSocketContext`), dựa trên cấu trúc của `SocketProvider` và `useSocketWithToken` hiện tại.

**Đặc điểm:**

- Chỉ hoạt động ở trang login (`/auth/login`)
- Payload kết nối khác biệt: `user_id`, `db_name`, `user_name` (placeholder)
- Tách biệt hoàn toàn với `SocketProvider` global
- Sử dụng `useSocket` base hook đã có

---

## 🎯 Mục tiêu

1. Tạo `LoginSocketProvider` và `useLoginSocketContext` riêng cho login page
2. Tạo hook `useLoginSocketWithToken` với payload placeholder `[payload]`
3. Tích hợp vào trang login và lắng nghe các sự kiện socket
4. Đảm bảo chỉ kết nối khi ở trang login

---

## 📁 Cấu trúc file mới

```
context/
  socket/
    LoginSocketContext.jsx          # Context và Provider cho login
hooks/
  socket/
    useLoginSocketWithToken.js      # Hook kết nối socket với token (login-specific)
pages/
  auth/
    login/
      index.jsx                     # Sử dụng LoginSocketProvider
```

---

## 🔧 Các bước triển khai

### **Bước 1: Tạo hook `useLoginSocketWithToken`**

**File:** `hooks/socket/useLoginSocketWithToken.js`

**Chức năng:**

- Tương tự `useSocketWithToken` nhưng đơn giản hơn (không cần Redux)
- Nhận payload trực tiếp: `{ user_id, db_name, user_name, socket_url }`
- `socket_url` được lấy từ `dataSetting?.socket_link_connect` (giống hệ thống hiện tại)
- Gọi API `/add-user` để lấy token
- Kết nối socket với token trong header
- Emit `connectedData` khi connect thành công

**Payload placeholder:**

```javascript
// [payload] - Placeholder data, sẽ được thay thế sau
const loginPayload = {
  user_id: 'PLACEHOLDER_USER_ID', // Thay bằng giá trị thực tế
  db_name: 'PLACEHOLDER_DB_NAME', // Thay bằng giá trị thực tế
  user_name: 'PLACEHOLDER_USER_NAME', // Thay bằng giá trị thực tế
  socket_url: dataSetting?.socket_link_connect || 'PLACEHOLDER_SOCKET_URL', // Lấy từ dataSetting giống hệ thống
};
```

**Cấu trúc:**

- State: `token`, `loading`, `error`
- useEffect: Fetch token từ API `/add-user` với payload
- useSocket: Kết nối với token trong `extraHeaders.auth`
- useEffect: Emit `connectedData` khi connect
- Return: `{ socket, loading, error }`

---

### **Bước 2: Tạo `LoginSocketContext` và `LoginSocketProvider`**

**File:** `context/socket/LoginSocketContext.jsx`

**Chức năng:**

- Tạo Context với default value: `{ socket: null, loading: true, error: null }`
- Provider component nhận props: `payload` (object chứa `user_id`, `db_name`, `user_name`, `socket_url`)
- `socket_url` trong payload sẽ được lấy từ `dataSetting?.socket_link_connect` (giống hệ thống hiện tại)
- Sử dụng `useLoginSocketWithToken` với payload
- Wrap children với Context.Provider

**Cấu trúc:**

```jsx
const LoginSocketContext = createContext({ socket: null, loading: true, error: null });

export const LoginSocketProvider = ({ children, payload }) => {
  const { socket, loading, error } = useLoginSocketWithToken(payload);

  return <LoginSocketContext.Provider value={{ socket, loading, error }}>{children}</LoginSocketContext.Provider>;
};

export const useLoginSocketContext = () => useContext(LoginSocketContext);
```

---

### **Bước 3: Tích hợp vào trang Login**

**File:** `pages/auth/login/index.jsx`

**Thay đổi:**

1. **Import:**

   ```jsx
   import { LoginSocketProvider, useLoginSocketContext } from '@/context/socket/LoginSocketContext';
   ```

2. **Lấy dataSetting và tạo payload:**

   ```jsx
   // Lấy dataSetting từ Redux hoặc useSetings hook
   const dataSetting = useSelector(state => state.setings);
   // Hoặc: const { data: dataSetting } = useSetings();

   // [payload] - Placeholder data cho socket connection
   const loginSocketPayload = {
     user_id: 'PLACEHOLDER_USER_ID', // Thay bằng giá trị thực tế
     db_name: 'PLACEHOLDER_DB_NAME', // Thay bằng giá trị thực tế
     user_name: 'PLACEHOLDER_USER_NAME', // Thay bằng giá trị thực tế
     socket_url: dataSetting?.socket_link_connect || '', // Lấy từ dataSetting giống hệ thống
   };
   ```

3. **Wrap component Login với Provider:**

   **Cách 1: Wrap toàn bộ JSX return (Khuyến nghị - không cần component con)**

   ```jsx
   const Login = props => {
     const dataSetting = useSelector(state => state.setings);

     const loginSocketPayload = {
       user_id: 'PLACEHOLDER_USER_ID',
       db_name: 'PLACEHOLDER_DB_NAME',
       user_name: 'PLACEHOLDER_USER_NAME',
       socket_url: dataSetting?.socket_link_connect || '',
     };

     return (
       <LoginSocketProvider payload={loginSocketPayload}>
         {/* Toàn bộ JSX của Login component */}
         <div>...</div>
       </LoginSocketProvider>
     );
   };
   ```

   **Cách 2: Tách component con (Nếu cần dùng hook ở top level)**

   ```jsx
   // Component con để sử dụng hook (vì hook chỉ dùng trong Provider)
   const LoginContent = props => {
     const { socket, loading, error } = useLoginSocketContext();
     // ... logic sử dụng socket ở đây
     return <div>{/* JSX của Login */}</div>;
   };

   // Component chính
   const Login = props => {
     const dataSetting = useSelector(state => state.setings);

     const loginSocketPayload = {
       user_id: 'PLACEHOLDER_USER_ID',
       db_name: 'PLACEHOLDER_DB_NAME',
       user_name: 'PLACEHOLDER_USER_NAME',
       socket_url: dataSetting?.socket_link_connect || '',
     };

     return (
       <LoginSocketProvider payload={loginSocketPayload}>
         <LoginContent {...props} />
       </LoginSocketProvider>
     );
   };
   ```

   **Lưu ý:**

   - **Cách 1 (khuyến nghị):** Không cần tách component con, có thể dùng `useLoginSocketContext()` trực tiếp trong component Login nếu Provider wrap toàn bộ JSX return
   - **Cách 2:** Chỉ cần tách nếu muốn dùng hook ở top level của component (ngoài return), hoặc muốn tách logic rõ ràng hơn

---

### **Bước 4: Lắng nghe sự kiện socket trong Login page**

**Trong component sử dụng `useLoginSocketContext`:**

```jsx
const { socket, loading, error } = useLoginSocketContext();

useEffect(() => {
  if (!socket) return;

  // Lắng nghe khi kết nối thành công
  const handleConnect = () => {
    console.log('🔌 Login socket connected:', socket.id);
  };

  // Lắng nghe các sự kiện cụ thể (ví dụ: QR scan success)
  const handleQRScanned = data => {
    console.log('QR scanned:', data);
    // Xử lý khi QR được quét thành công
  };

  const handleQRExpired = data => {
    console.log('QR expired:', data);
    // Xử lý khi QR hết hạn
  };

  // Đăng ký listeners
  socket.on('connect', handleConnect);
  socket.on('qr_scanned', handleQRScanned);
  socket.on('qr_expired', handleQRExpired);
  socket.on('connect_error', err => {
    console.error('Login socket error:', err);
  });

  // Cleanup
  return () => {
    socket.off('connect', handleConnect);
    socket.off('qr_scanned', handleQRScanned);
    socket.off('qr_expired', handleQRExpired);
    socket.off('connect_error');
  };
}, [socket]);
```

---

## 📝 Cách sử dụng chi tiết

### **1. Setup Provider ở Login Page**

```jsx
// pages/auth/login/index.jsx
import { LoginSocketProvider } from '@/context/socket/LoginSocketContext';
import { useSelector } from 'react-redux';
// Hoặc: import { useSetings } from '@/hooks/useAuth';

const Login = props => {
  // Lấy dataSetting từ Redux (giống hệ thống hiện tại)
  const dataSetting = useSelector(state => state.setings);
  // Hoặc: const { data: dataSetting } = useSetings();

  // [payload] - Chuẩn bị payload (sẽ thay placeholder sau)
  const loginSocketPayload = {
    user_id: 'PLACEHOLDER_USER_ID',
    db_name: 'PLACEHOLDER_DB_NAME',
    user_name: 'PLACEHOLDER_USER_NAME',
    socket_url: dataSetting?.socket_link_connect || '', // Lấy từ dataSetting giống hệ thống
  };

  return <LoginSocketProvider payload={loginSocketPayload}>{/* Nội dung login page */}</LoginSocketProvider>;
};
```

### **2. Sử dụng hook trong component con**

```jsx
// Component bên trong LoginSocketProvider
import { useLoginSocketContext } from '@/context/socket/LoginSocketContext';

const LoginForm = () => {
  const { socket, loading, error } = useLoginSocketContext();

  // Kiểm tra trạng thái
  if (loading) return <div>Đang kết nối socket...</div>;
  if (error) return <div>Lỗi kết nối: {error.message}</div>;

  // Sử dụng socket
  useEffect(() => {
    if (!socket) return;

    // Lắng nghe sự kiện
    socket.on('qr_scanned', data => {
      // Xử lý khi QR được quét
    });

    return () => {
      socket.off('qr_scanned');
    };
  }, [socket]);

  return <div>Login Form</div>;
};
```

### **3. Emit sự kiện (nếu cần)**

```jsx
const handleAction = () => {
  if (socket?.connected) {
    socket.emit('event_name', { data: 'value' });
  }
};
```

---

## 🔄 Flow hoạt động

```
1. Login Page render
   ↓
2. LoginSocketProvider nhận payload (placeholder)
   ↓
3. useLoginSocketWithToken được gọi với payload
   ↓
4. Fetch token từ API: POST /add-user với payload
   ↓
5. Nhận token từ response
   ↓
6. useSocket kết nối với token trong header
   ↓
7. Socket connect thành công
   ↓
8. Emit 'connectedData' với payload
   ↓
9. Component sử dụng useLoginSocketContext() để lắng nghe events
```

---

## ✅ Checklist triển khai

- [ ] **Bước 1:** Tạo `hooks/socket/useLoginSocketWithToken.js`

  - [ ] Import `useSocket` và các dependencies
  - [ ] Tạo state: `token`, `loading`, `error`
  - [ ] useEffect fetch token từ `/add-user` với payload `[payload]`
  - [ ] useSocket kết nối với token
  - [ ] useEffect emit `connectedData` khi connect
  - [ ] Return `{ socket, loading, error }`

- [ ] **Bước 2:** Tạo `context/socket/LoginSocketContext.jsx`

  - [ ] Tạo `LoginSocketContext` với default value
  - [ ] Tạo `LoginSocketProvider` component
  - [ ] Sử dụng `useLoginSocketWithToken` với payload prop
  - [ ] Export `useLoginSocketContext` hook

- [ ] **Bước 3:** Tích hợp vào `pages/auth/login/index.jsx`

  - [ ] Import `LoginSocketProvider` và `useLoginSocketContext`
  - [ ] Tạo payload object với placeholder `[payload]`
  - [ ] Wrap component với `LoginSocketProvider`
  - [ ] Sử dụng `useLoginSocketContext` trong component con

- [ ] **Bước 4:** Lắng nghe socket events

  - [ ] useEffect lắng nghe `connect`
  - [ ] useEffect lắng nghe các events cần thiết (ví dụ: `qr_scanned`, `qr_expired`)
  - [ ] Cleanup listeners khi unmount

- [ ] **Bước 5:** Test và kiểm tra
  - [ ] Kiểm tra socket kết nối thành công
  - [ ] Kiểm tra emit `connectedData` đúng payload
  - [ ] Kiểm tra nhận events từ server
  - [ ] Kiểm tra cleanup khi unmount

---

## 📌 Lưu ý

1. **Payload placeholder:** Các giá trị `PLACEHOLDER_USER_ID`, `PLACEHOLDER_DB_NAME`, `PLACEHOLDER_USER_NAME` cần được thay thế bằng giá trị thực tế sau
2. **Socket URL:** Lấy từ `dataSetting?.socket_link_connect` (giống hệ thống hiện tại), không cần placeholder
3. **Component con:** **Không cần tách component con** - có thể dùng `useLoginSocketContext()` trực tiếp trong component Login nếu Provider wrap toàn bộ JSX return. Chỉ tách nếu muốn dùng hook ở top level hoặc tách logic rõ ràng hơn
4. **Events:** Cần xác định các events cụ thể mà login page cần lắng nghe (ví dụ: `qr_scanned`, `login_success`)
5. **Tách biệt:** `LoginSocketProvider` hoàn toàn độc lập với `SocketProvider` global
6. **Lifecycle:** Socket chỉ kết nối khi component mount và disconnect khi unmount
7. **DataSetting:** Có thể lấy từ Redux (`useSelector(state => state.setings)`) hoặc từ hook `useSetings()` - giống cách hệ thống hiện tại đang làm

---

## 🎯 Tổng hợp từng bước

### **Bước 1: Tạo hook `useLoginSocketWithToken`**

- File: `hooks/socket/useLoginSocketWithToken.js`
- Chức năng: Fetch token, kết nối socket, emit connectedData
- Input: Payload object `{ user_id, db_name, user_name, socket_url }` (placeholder)
- Output: `{ socket, loading, error }`

### **Bước 2: Tạo Context và Provider**

- File: `context/socket/LoginSocketContext.jsx`
- Chức năng: Context API để share socket instance
- Components: `LoginSocketProvider`, `useLoginSocketContext`

### **Bước 3: Tích hợp vào Login Page**

- File: `pages/auth/login/index.jsx`
- Thay đổi:
  - Lấy `dataSetting` từ Redux (`useSelector(state => state.setings)`) hoặc `useSetings()` hook
  - Tạo payload với `socket_url` từ `dataSetting?.socket_link_connect` (giống hệ thống hiện tại)
  - Wrap với `LoginSocketProvider`, sử dụng `useLoginSocketContext`
  - **Không cần tách component con** - có thể dùng hook trực tiếp trong component nếu Provider wrap toàn bộ JSX return
- Payload: Tạo object với placeholder `[payload]` cho `user_id`, `db_name`, `user_name`, còn `socket_url` lấy từ `dataSetting`

### **Bước 4: Lắng nghe Events**

- Location: Trong component sử dụng `useLoginSocketContext`
- Events: `connect`, `qr_scanned`, `qr_expired`, `connect_error` (và các events khác cần thiết)
- Cleanup: Remove listeners khi unmount

### **Bước 5: Test và hoàn thiện**

- Kiểm tra kết nối socket
- Kiểm tra emit/receive events
- Thay thế placeholder payload bằng giá trị thực tế
- Xử lý edge cases (error, loading states)

---

## 📚 Tài liệu tham khảo

- Cấu trúc socket hiện tại: `context/socket/SocketContext.jsx`
- Hook base: `hooks/socket/useSocket.js`
- Hook với token: `hooks/socket/useSocketWithToken.js`
