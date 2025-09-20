import { useEffect } from 'react';
import { useGamification } from '../../contexts/gamification/useGamification';
import { useNotifications } from '../../contexts/NotificationContext';

const KEY = 'daily-login:last-award';

export const DailyLoginAward: React.FC = () => {
  const { awardEvent } = useGamification();
  const { addNotification } = useNotifications();

  useEffect(() => {
    try {
      const last = localStorage.getItem(KEY);
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
      if (last !== todayKey) {
        const res = awardEvent('DAILY_LOGIN', {});
        if (res) {
          addNotification?.({ type: 'info', title: 'Daily Reward', message: `Welcome back! +${res.pointsAwarded} pts.` });
        }
        localStorage.setItem(KEY, todayKey);
      }
    } catch {}
  }, [awardEvent, addNotification]);

  return null;
};

export default DailyLoginAward;
