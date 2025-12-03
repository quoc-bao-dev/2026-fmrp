import apiNoti from '@/Api/apiNoti/apiNoti';
import { optionsQuery } from '@/configs/optionsQuery';
import useToast from '@/hooks/useToast';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetCheckNotiRead = () => {
  const fetchGetCheckNotiRead = async () => {
    const response = await apiNoti.getCheckNotiRead();
    return response;
  };
  return useQuery({
    queryKey: ['api_get_check_noti_read'],
    queryFn: fetchGetCheckNotiRead,
    ...optionsQuery,
  });
};

export const useListNoti = ({ params = {}, open }) => {
  const baseParams = { limit: 10, is_web: 1, ...params };

  const fetchListNoti = async ({ pageParam = 1 }) => {
    const response = await apiNoti.apiListNoti({ params: { ...baseParams, page: pageParam } });
    return { ...response.data, page: pageParam };
  };

  return useInfiniteQuery({
    queryKey: ['api_list_noti', baseParams],
    queryFn: fetchListNoti,
    getNextPageParam: lastPage => {
      if (lastPage?.next > 0) {
        return (lastPage?.page || 1) + 1;
      }
      return undefined;
    },
    enabled: open,
    ...optionsQuery,
  });
};

export const useReadSingleNoti = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const fetchReadSingleNoti = async (params) => {
    const response = await apiNoti.apiReadSingleNoti({params});
    return response;
  };

  return useMutation({
    mutationKey: ['api_read_single_noti'],
    mutationFn: fetchReadSingleNoti,
    onSuccess: (_, variables) => {
      const notificationId = variables?.notification_id;
      if (!notificationId) return;

      queryClient.setQueriesData({ queryKey: ['api_list_noti'] }, oldData => {
        if (!oldData?.pages) return oldData;
        const pages = oldData.pages.map(page => {
          if (!page?.notifications) return page;
          const updatedNotifications = page.notifications.map(item =>
            item.id === notificationId ? { ...item, is_read: 1 } : item
          );
          return { ...page, notifications: updatedNotifications };
        });
        return { ...oldData, pages };
      });

      queryClient.invalidateQueries({ queryKey: ['api_get_check_noti_read'] });
      toast('success', 'Đã đánh dấu thông báo là đã đọc');
    },
    onError: () => {
      toast('error', 'Không thể cập nhật trạng thái thông báo');
    },
    ...optionsQuery,
  });
};

export const useReadAllNoti = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const fetchReadAllNoti = async (params) => {
    const response = await apiNoti.apiReadAllNoti({params});
    return response;
  };

  return useMutation({
    mutationKey: ['api_read_all_noti'],
    mutationFn: fetchReadAllNoti,
    onSuccess: () => {
      queryClient.setQueriesData({ queryKey: ['api_list_noti'] }, oldData => {
        if (!oldData?.pages) return oldData;
        const pages = oldData.pages.map(page => {
          if (!page?.notifications) return page;
          const updatedNotifications = page.notifications.map(item => ({ ...item, is_read: 1 }));
          return { ...page, notifications: updatedNotifications };
        });
        return { ...oldData, pages };
      });

      queryClient.invalidateQueries({ queryKey: ['api_get_check_noti_read'] });
      toast('success', 'Đã đánh dấu tất cả thông báo');
    },
    onError: () => {
      toast('error', 'Không thể đánh dấu tất cả thông báo');
    },
    ...optionsQuery,
  });
};
