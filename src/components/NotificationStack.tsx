import { useNotifications } from '../contexts/NotificationContext';
import Notification from './Notification';

export default function NotificationStack() {
    const { notifications } = useNotifications();

    console.log('[NotificationStack] Rendering with', notifications.length, 'notification(s):', notifications);

    return (
        <div className="absolute inset-0 pointer-events-none z-90">
            {notifications.map(n => (
                <Notification key={n.key} notification={n} />
            ))}
        </div>
    );
}
