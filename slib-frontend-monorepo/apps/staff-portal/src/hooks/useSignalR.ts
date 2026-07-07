import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

export interface AppNotification {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const useSignalR = (hubUrl: string) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [inventoryScans, setInventoryScans] = useState<any[]>([]);
  const [assetStatuses, setAssetStatuses] = useState<Record<number, { status: string, message: string }>>({});

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [hubUrl]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to SignalR Hub');
          
          connection.on('ReceiveMessage', (user: string, message: string) => {
            const newNotif: AppNotification = {
              id: Date.now().toString(),
              sender: user,
              message,
              timestamp: new Date(),
              read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
          });

          connection.on('ReceiveInventoryScan', (scanResult: any) => {
            setInventoryScans(prev => [scanResult, ...prev]);
          });

          connection.on('ReceiveAssetStatus', (assetId: number, status: string, message: string) => {
            setAssetStatuses(prev => ({
              ...prev,
              [assetId]: { status, message }
            }));
          });
        })
        .catch(e => console.log('SignalR Connection failed: ', e));
    }

    return () => {
      if (connection) {
        connection.off('ReceiveMessage');
        connection.off('ReceiveInventoryScan');
        connection.off('ReceiveAssetStatus');
        connection.stop();
      }
    };
  }, [connection]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearInventoryScans = useCallback(() => {
    setInventoryScans([]);
  }, []);

  return { notifications, markAsRead, markAllAsRead, inventoryScans, clearInventoryScans, assetStatuses };
};
