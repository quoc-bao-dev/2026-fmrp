import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { useAppContext } from '@/context/_state/version-application/VersionContext';
import { useSocketContext } from '@/context/socket/SocketContext';
import { useSheet } from '@/context/ui/SheetContext';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSettingExpiration from '@/hooks/useSettingExpiration';
import PopupGlobal from '../common/popup/PopupGlobal';
import PopupUpdateNewVersion from '../common/popup/PopupUpdateNewVersion';
import ChatBubbleAI from '../UI/chat/ChatAiBubble';
import ImagesModal from '../UI/images/ImagesModal';
import PopupAccountInformation from '../UI/popup/PopupAccountInformation';
import PopupAppRenewal from '../UI/popup/PopupAppRenewal';
import PopupAppTrial from '../UI/popup/PopupAppTrial';
import PopupChangePassword from '../UI/popup/PopupChangePassword';
import PopupRecommendation from '../UI/popup/PopupRecommendation';
import PopupSuccessfulPayment from '../UI/popup/PopupSuccessfulPayment';
import PopupSuccessfulBuyMoreUser from '../UI/popup/PopupSuccessfulBuyMoreUser';
import PopupUpdateVersion from '../UI/popup/PopupUpdateVersion';
import PopupUpgradeProfessional from '../UI/popup/PopupUpgradeProfessional';
import PopupUpgradePro from '../UI/popup/PopupUpgradePro';
import Header from './header';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Index = ({ children, ...props }) => {
  const router = useRouter();

  // lấy phân quyền
  const { closeSheet } = useSheet();

  const { queryStateProvider } = useContext(StateContext);
  const stateBoxChatAi = useSelector(state => state?.stateBoxChatAi);

  const statePopupPreviewImage = useSelector(state => state?.statePopupPreviewImage);

  const statePopupAccountInformation = useSelector(state => state.statePopupAccountInformation);
  const statePopupChangePassword = useSelector(state => state.statePopupChangePassword);
  const statePopupRecommendation = useSelector(state => state.statePopupRecommendation);
  const statePopupUpdateVersion = useSelector(state => state.statePopupUpdateVersion);
  const statePopupUpgradeProfessional = useSelector(state => state.statePopupUpgradeProfessional);
  const statePopupUpgradePro = useSelector(state => state.statePopupUpgradePro);
  const statePopupSuccessfulPayment = useSelector(state => state.statePopupSuccessfulPayment);
  const statePopupSuccessfulBuyMoreUser = useSelector(state => state.statePopupSuccessfulBuyMoreUser);
  const statePopupGlobal = useSelector(state => state.statePopupGlobal);

  const { isExpired } = useSettingExpiration();

  useEffect(() => {
    if (!router?.route?.startsWith('/manufacture/productions-orders')) {
      closeSheet('manufacture-productions-orders');
      queryStateProvider(prev => ({
        productionsOrders: {
          ...prev.productionsOrders,
          selectedImages: [],
          uploadProgress: {},
          inputCommentText: '',
          taggedUsers: [],
        },
      }));
    }
  }, [router.isReady, router?.route]);

  // console.log("router", router);

  const { hasNewVersion, version, setHasNewVersion, refetchVersion } = useAppContext();
  const dispatch = useDispatch();
  const { socket } = useSocketContext();

  useEffect(() => {
    if (hasNewVersion) {
      dispatch({
        type: 'statePopupGlobal',
        payload: {
          open: true,
          allowOutsideClick: false,
          allowEscape: false,
          children: <PopupUpdateNewVersion version={version} setHasNewVersion={setHasNewVersion} />,
        },
      });
    }
  }, [hasNewVersion, version]);
  const queryClient = useQueryClient();

  // Auto open Pro upgrade popup when system is expired
  useEffect(() => {
    if (isExpired && !statePopupUpgradePro?.open) {
      dispatch({
        type: 'statePopupUpgradePro',
        payload: { open: true },
      });
    }
  }, [isExpired, statePopupUpgradePro?.open, dispatch]);

  useEffect(() => {
    if (!socket) return;
    const topic = `update_version`;

    socket.on(topic, async data => {
      if (data && data.data) {
        await queryClient.invalidateQueries(['versionApplication']);
        await refetchVersion(); //check nếu có 2 version cùng lúc lấy bản mới nhất
      }
    });

    return () => {
      socket.off(topic);
    };
  }, [socket]);

  return (
    <QueryClientProvider client={queryClient}>
      {router.pathname == '/manufacture/productions-orders-mobile' || router.pathname == '/manufacture/production-plan-mobile' ? (
        children
      ) : (
        <React.Fragment>
          <Header />
          {children}
          {stateBoxChatAi.isShowAi && <ChatBubbleAI {...props} />}
          {/* {stateBoxChatAi.isShowAi} */}
          {statePopupPreviewImage.open && <ImagesModal {...props} />}
          {statePopupGlobal.open && <PopupGlobal {...props} />}

          <PopupAppTrial {...props} />
          <PopupAppRenewal {...props} />
          {statePopupUpdateVersion?.open && <PopupUpdateVersion {...props} />}
          {statePopupAccountInformation?.open && <PopupAccountInformation {...props} />}
          {statePopupChangePassword?.open && <PopupChangePassword {...props} />}
          {statePopupRecommendation?.open && <PopupRecommendation {...props} />}
          {statePopupUpgradeProfessional?.open && <PopupUpgradeProfessional {...props} />}
          {statePopupUpgradePro?.open && (
            <PopupUpgradePro
              open={statePopupUpgradePro.open}
              onClose={() => {
                dispatch({
                  type: 'statePopupUpgradePro',
                  payload: { open: false },
                });
              }}
              onUpgrade={() => {
                // Đóng popup Pro upgrade hiện tại
                dispatch({
                  type: 'statePopupUpgradePro',
                  payload: { open: false },
                });

                // Mở popup nâng cấp Professional giống ở header
                dispatch({
                  type: 'statePopupGlobal',
                  payload: {
                    open: true,
                    children: (
                      <PopupUpgradeProfessional
                        {...props}
                        onClose={() =>
                          dispatch({
                            type: 'statePopupGlobal',
                            payload: { open: false },
                          })
                        }
                      />
                    ),
                  },
                });
              }}
            />
          )}
          {statePopupSuccessfulPayment?.open && <PopupSuccessfulPayment {...props} />}
          {statePopupSuccessfulBuyMoreUser?.open && <PopupSuccessfulBuyMoreUser {...props} />}
        </React.Fragment>
      )}

      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default Index;
