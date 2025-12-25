import useSetingServer from '@/hooks/useConfigNumber';
import { useMemo } from 'react';

// Number of days to be considered "nearly expired" (can be adjusted here)
export const NEARLY_EXPIRED_DAYS = 7;

/**
 * Hook to read system settings and compute remaining days until expiration
 * Source: api_web/api_setting/getSettings?csrf_protection=true
 *   -> response.settings.expiration_date: "YYYY-MM-DD"
 */
const useSettingExpiration = () => {
  const settings = useSetingServer(); // state.setings

  const daysLeft = useMemo(() => {
    const exp = settings?.expiration_date;

    if (!exp) return null;

    const expDate = new Date(exp);
    if (Number.isNaN(expDate.getTime())) return null;

    const now = new Date();
    // Compare by date only (strip time)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfExp = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const diffDays = Math.floor((startOfExp.getTime() - startOfToday.getTime()) / MS_PER_DAY);

    // Return the exact number of days remaining
    // If today == expiration_date => 0 days left (expired)
    // If today is before expiration_date => positive number of days
    return diffDays;
  }, [settings?.expiration_date]);

  return {
    daysLeft,
    // true when remaining days > 0 and <= NEARLY_EXPIRED_DAYS (not fully expired yet)
    isNearlyExpired: typeof daysLeft === 'number' && daysLeft > 0 && daysLeft <= NEARLY_EXPIRED_DAYS,
    // true when subscription is already expired (daysLeft <= 0)
    isExpired: typeof daysLeft === 'number' && daysLeft <= 0,
  };
};

export default useSettingExpiration;


