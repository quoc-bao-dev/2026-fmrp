import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { useAppContext } from '@/context/_state/version-application/VersionContext';
import { useSocketContext } from '@/context/socket/SocketContext';
import { useSheet } from '@/context/ui/SheetContext';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSettingExpiration from '@/hooks/useSettingExpiration';
import { useGetUpgradePackage } from '@/hooks/useAuth';
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
  const { data: upgradePackageData } = useGetUpgradePackage();

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

  // Auto open Pro upgrade popup when system is expired - block UI
  useEffect(() => {
    if (isExpired && !statePopupUpgradePro?.open) {
      dispatch({
        type: 'statePopupUpgradePro',
        payload: { open: true },
      });
    }
  }, [isExpired, statePopupUpgradePro?.open, dispatch]);

  // Block other popups when expired (except UpgradePro and PopupGlobal for upgrade flow)
  useEffect(() => {
    if (isExpired) {
      // Close other popups when expired
      if (statePopupUpdateVersion?.open) {
        dispatch({
          type: 'statePopupUpdateVersion',
          payload: { open: false },
        });
      }
      if (statePopupAccountInformation?.open) {
        dispatch({
          type: 'statePopupAccountInformation',
          payload: { open: false },
        });
      }
      if (statePopupChangePassword?.open) {
        dispatch({
          type: 'statePopupChangePassword',
          payload: { open: false },
        });
      }
      if (statePopupRecommendation?.open) {
        dispatch({
          type: 'statePopupRecommendation',
          payload: { open: false },
        });
      }
      if (statePopupUpgradeProfessional?.open) {
        dispatch({
          type: 'statePopupUpgradeProfessional',
          payload: { open: false },
        });
      }
      if (statePopupSuccessfulPayment?.open) {
        dispatch({
          type: 'statePopupSuccessfulPayment',
          payload: { open: false },
        });
      }
      if (statePopupSuccessfulBuyMoreUser?.open) {
        dispatch({
          type: 'statePopupSuccessfulBuyMoreUser',
          payload: { open: false },
        });
      }
      if (statePopupPreviewImage?.open) {
        dispatch({
          type: 'statePopupPreviewImage',
          payload: { open: false },
        });
      }
      // Only allow PopupGlobal if it's for upgrade flow (contains PopupUpgradeProfessional)
      // Close PopupGlobal if it contains PopupUpdateNewVersion
      if (statePopupGlobal?.open) {
        // Check if PopupGlobal contains PopupUpdateNewVersion by checking for version prop
        const isUpdateNewVersion = statePopupGlobal?.children?.props?.version !== undefined;
        
        // Close if it's PopupUpdateNewVersion, otherwise allow it (assumed to be from upgrade flow)
        if (isUpdateNewVersion) {
          dispatch({
            type: 'statePopupGlobal',
            payload: { open: false },
          });
        }
      }
    }
  }, [isExpired, dispatch, statePopupUpdateVersion?.open, statePopupAccountInformation?.open, 
      statePopupChangePassword?.open, statePopupRecommendation?.open, statePopupUpgradeProfessional?.open,
      statePopupSuccessfulPayment?.open, statePopupSuccessfulBuyMoreUser?.open, statePopupPreviewImage?.open,
      statePopupGlobal?.open]);

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
          {router.pathname !== '/piecework-wage/import-output' &&  <Header />}
          {children}
          {stateBoxChatAi.isShowAi && !isExpired && <ChatBubbleAI {...props} />}
          {/* {stateBoxChatAi.isShowAi} */}
          {statePopupPreviewImage.open && !isExpired && <ImagesModal {...props} />}
          {statePopupGlobal.open && <PopupGlobal {...props} />}

          {!isExpired && <PopupAppTrial {...props} />}
          {/* <PopupAppRenewal {...props} /> */}
          {statePopupUpdateVersion?.open && !isExpired && <PopupUpdateVersion {...props} />}
          {statePopupAccountInformation?.open && !isExpired && <PopupAccountInformation {...props} />}
          {statePopupChangePassword?.open && !isExpired && <PopupChangePassword {...props} />}
          {statePopupRecommendation?.open && !isExpired && <PopupRecommendation {...props} />}
          {statePopupUpgradeProfessional?.open && !isExpired && (
            <PopupUpgradeProfessional
              {...props}
              upgradePackageData={upgradePackageData}
            />
          )}
          {statePopupUpgradePro?.open && (
            <PopupUpgradePro
              open={statePopupUpgradePro.open}
              onClose={() => {
                // Không cho phép đóng khi hết hạn
                if (!isExpired) {
                  dispatch({
                    type: 'statePopupUpgradePro',
                    payload: { open: false },
                  });
                }
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
                    allowOutsideClick: false,
                    allowEscape: false,
                    children: (
                      <PopupUpgradeProfessional
                        {...props}
                        upgradePackageData={upgradePackageData}
                        onClose={() => {
                          // Khi đóng PopupUpgradeProfessional, nếu vẫn hết hạn thì mở lại PopupUpgradePro
                          dispatch({
                            type: 'statePopupGlobal',
                            payload: { open: false },
                          });
                          if (isExpired) {
                            dispatch({
                              type: 'statePopupUpgradePro',
                              payload: { open: true },
                            });
                          }
                        }}
                      />
                    ),
                  },
                });
              }}
            />
          )}
          {statePopupSuccessfulPayment?.open && !isExpired && <PopupSuccessfulPayment {...props} />}
          {statePopupSuccessfulBuyMoreUser?.open && !isExpired && <PopupSuccessfulBuyMoreUser {...props} />}
        </React.Fragment>
      )}

      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default Index;
