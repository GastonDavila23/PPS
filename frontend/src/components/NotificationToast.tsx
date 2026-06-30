import React from 'react';
import { InfoCircleFill, CheckCircleFill, ExclamationTriangleFill, XCircleFill, X } from 'react-bootstrap-icons';
import './../index.css';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface Props {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationToast: React.FC<Props> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`
            relative p-4 rounded-2xl shadow-2xl border flex gap-3 animate-in slide-in-from-right duration-300
            ${n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ''}
            ${n.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
            ${n.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            ${n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
          `}
        >
          <div className="shrink-0 mt-0.5">
            {n.type === 'success' && <CheckCircleFill size={18} />}
            {n.type === 'error' && <XCircleFill size={18} />}
            {n.type === 'info' && <InfoCircleFill size={18} />}
            {n.type === 'warning' && <ExclamationTriangleFill size={18} />}
          </div>
          
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
              {n.title}
            </p>
            <p className="text-xs font-medium leading-tight opacity-90">
              {n.message}
            </p>
          </div>

          <button 
            onClick={() => removeNotification(n.id)}
            className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;