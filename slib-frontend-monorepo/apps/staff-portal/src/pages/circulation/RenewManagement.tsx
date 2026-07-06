// Chức năng gia hạn đã được tích hợp vào trong LoanHistory, trang này đóng vai trò shortcut
import React from 'react';
import { LoanHistory } from '../../features/circulation/components/LoanHistory';

export const RenewManagement = () => {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 text-amber-800 p-4 rounded-lg font-medium border border-amber-200">
        Mẹo: Đây là màn hình Tra cứu mượn trả. Bạn có thể nhấn nút "Gia hạn" ở cột thao tác bên phải để thực hiện gia hạn nhanh cho sinh viên.
      </div>
      <LoanHistory />
    </div>
  );
};
