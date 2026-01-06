import { useEffect, useRef, useState } from 'react';
import useSocket from './useSocket'; // 🔁 Import lại hook đã có
import { useDispatch } from 'react-redux';
import PopupSuccessfulPayment from '@/components/UI/popup/PopupSuccessfulPayment';
import PopupSuccessfulBuyMoreUser from '@/components/UI/popup/PopupSuccessfulBuyMoreUser';
import { useSelector } from 'react-redux';
import { useAuththentication } from '../useAuth';
import { useHistoryUpgradePackage } from '@/managers/api/upgrade-package/useHistoryUpgradePackage';

export const useSocketWithToken = ({ auth, dataSetting }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const globalAuth = useSelector(state => state.auth);
  const { data: dataAuth, isLoading, refetch } = useAuththentication(globalAuth);
  const { refetch: refetchHistoryUpgradePackage } = useHistoryUpgradePackage();

  const hasFetched = useRef(false); // Đảm bảo chỉ fetch 1 lần

  useEffect(() => {
    // ✅ Chặn chạy khi chưa có thông tin cần thiết
    if (hasFetched.current || !auth?.staff_id || !dataSetting?.db_name || !auth?.user_full_name || !dataSetting?.socket_link_connect) return;

    hasFetched.current = true;

    const init = async () => {
      setLoading(true);

      const dataSubmit = {
        user_id: auth?.staff_id,
        db_name: dataSetting?.db_name,
        user_name: auth?.user_full_name,
      };

      try {
        const res = await fetch(`${dataSetting?.socket_link_connect}/add-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataSubmit),
        });

        const result = await res.json();

        const token = result?.token;

        if (token) {
          setToken(token);
        } else {
          setError('Không có token từ server');
        }
      } catch (err) {
        console.error('Socket init error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [auth, dataSetting]);

  // ✅ Luôn gọi useSocket, nhưng chỉ thực sự connect khi đủ điều kiện
  const shouldConnect = !!token && !!dataSetting?.socket_link_connect;

  const socket = useSocket(
    dataSetting?.socket_link_connect,
    {
      extraHeaders: {
        auth: token,
      },
    },
    shouldConnect // ← thêm flag này
  );

  // Emit connectedData tại đây
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('🔌 Global socket connected:', socket.id);
      socket.emit('connectedData', {
        user_id: auth?.staff_id,
        db_name: dataSetting?.db_name,
        user_name: auth?.user_full_name,
      });
    };

    socket.on('upgrade_package', data => {
      console.log('upgrade_package', data);

      if (data.data.status == 'success') {
        refetch();
      }
    });

    socket.on('upgrade_package_success', data => {
      refetchHistoryUpgradePackage();
      console.log('upgrade_package_success', data)
      if (data.data.status == 'success') {
        dispatch({
          type: 'statePopupGlobal',
          payload: {
            open: false,
          },
        });
        setTimeout(() => {
          dispatch({
            type: 'statePopupGlobal',
            payload: {
              open: true,
              children: (
                <PopupSuccessfulPayment
                  data={data.data}
                  onClose={() =>
                    dispatch({
                      type: 'statePopupSuccessfulPayment',
                      payload: { open: false },
                    })
                  }
                />
              ),
            },
          });
        }, 1000);
        refetch();
      }
    });

    socket.on('upgrade_package_user', data => {
      console.log('upgrade_package_user', data);
      if (data.data.status == 'success') {
        refetchHistoryUpgradePackage();
        dispatch({
          type: 'statePopupGlobal',
          payload: {
            open: false,
          },
        });
        setTimeout(() => {
          dispatch({
            type: 'statePopupGlobal',
            payload: {
              open: true,
              children: (
                <PopupSuccessfulBuyMoreUser
                  data={data.data}
                  onClose={() =>
                    dispatch({
                      type: 'statePopupSuccessfulBuyMoreUser',
                      payload: { open: false },
                    })
                  }
                />
              ),
            },
          });
        }, 1000);
        refetch();
      }
    });

    socket.on('upgrade_package_user_success', data => {
      console.log('upgrade_package_user_success', data);

      refetchHistoryUpgradePackage();
      dispatch({
        type: 'statePopupGlobal',
        payload: {
          open: false,
        },
      });
      setTimeout(() => {
        dispatch({
          type: 'statePopupGlobal',
          payload: {
            open: true,
            children: (
              <PopupSuccessfulBuyMoreUser
                data={data.data}
                onClose={() =>
                  dispatch({
                    type: 'statePopupSuccessfulBuyMoreUser',
                    payload: { open: false },
                  })
                }
              />
            ),
          },
        });
      }, 1000);
      refetch();
    });

    socket.on('connect', handleConnect);
    socket.on('connect_error', err => {
      console.error('Socket connection error:', err?.message, err?.data);
    });

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error');
    };
  }, [socket, auth, dataSetting]);

  // Gắn sự kiện (nếu cần) tại component sử dụng
  return { socket, loading, error };
};
