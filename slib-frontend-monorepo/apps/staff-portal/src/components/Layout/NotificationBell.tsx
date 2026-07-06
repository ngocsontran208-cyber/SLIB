import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useSignalR } from '../../hooks/useSignalR';

// Fix cứng port 5132 theo BE
const HUB_URL = 'http://localhost:5132/hubs/notification'; 

export const NotificationBell: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useSignalR(HUB_URL);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
        )}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-slate-100 dark:border-slate-700/50 z-50 flex flex-col overflow-hidden max-h-96">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">Đánh dấu đã đọc</button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${n.read ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 opacity-70' : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className={`mt-0.5 ${n.read ? 'text-slate-400' : 'text-primary-500'}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className={`text-sm leading-tight ${n.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {n.timestamp.toLocaleTimeString()} - {n.sender}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
