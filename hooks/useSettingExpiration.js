import { useSelector } from 'react-redux';

/**
 * Hook to read system settings and compute remaining days until expiration
 * Source: auth.info from Redux state
 *   -> auth.info.day_expiration: number of days remaining
 *   -> auth.info.fail_expiration: boolean indicating if nearly expired
 */
const useSettingExpiration = () => {
  const auth = useSelector(state => state.auth);

  const daysLeft = auth?.day_expiration ?? null;
  const isNearlyExpired = auth?.fail_expiration ?? false;
  const isExpired = typeof daysLeft === 'number' && daysLeft <= 0;

  return {
    daysLeft,
    isNearlyExpired,
    isExpired,
  };
};

export default useSettingExpiration;


