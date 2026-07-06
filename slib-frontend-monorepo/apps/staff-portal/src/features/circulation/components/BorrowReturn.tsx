import React, { useState, useRef, useEffect } from 'react';
import { CirculationService } from '@slib/api-client';
import { ScanLine, User, BookOpen, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BorrowReturn: React.FC = () => {
  const { t } = useTranslation();
  const [patronId, setPatronId] = useState('');
  const [patronData, setPatronData] = useState<any>(null);
  const [itemBarcode, setItemBarcode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string, mockLoanId?: number } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Giả lập lấy thông tin bạn đọc
  const fetchPatron = (id: string) => {
    if (!id) return;
    // Tạm thời mock data chờ API
    setPatronData({
      id: parseInt(id),
      fullName: 'Nguyễn Văn Sinh Viên',
      role: 'Student',
      email: 'student@university.edu.vn',
      activeLoans: 2,
      fines: 50000,
      avatar: 'https://ui-avatars.com/api/?name=Sinh+Vien&background=0D8ABC&color=fff'
    });
    // Auto focus sang ô quét sách
    barcodeInputRef.current?.focus();
  };

  const handlePatronKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchPatron(patronId);
    }
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemBarcode) return;
    
    if (!patronData) {
      setMessage({ type: 'error', text: 'Vui lòng quét thẻ bạn đọc trước khi mượn sách.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await CirculationService.borrowBook({
        userId: patronData.id,
        barcode: itemBarcode
      });
      setMessage({ type: 'success', text: `Đã mượn thành công tài liệu có mã vạch ${itemBarcode}.` });
      setItemBarcode('');
      // Cập nhật lại số sách đang mượn
      setPatronData((prev: any) => ({ ...prev, activeLoans: prev.activeLoans + 1 }));
    } catch (error: any) {
      // Giả lập logic: Nếu sách đang mượn, API sẽ trả về lỗi, FE sẽ bắt lỗi này để hiện nút Trả Sách
      // Ở đây ta mock bắt lỗi 400 hoặc message chứa "already borrowed"
      const errorMsg = error.response?.data || 'Lỗi hệ thống hoặc Sách này đang được mượn.';
      setMessage({ 
        type: 'warning', 
        text: `Tài liệu ${itemBarcode} đang được mượn bởi người khác. Trả sách vào kho?`,
        mockLoanId: 9999 // Fake loan ID để demo chức năng trả
      });
    } finally {
      setLoading(false);
      barcodeInputRef.current?.focus();
    }
  };

  const handleReturn = async (loanId: number) => {
    setLoading(true);
    try {
      await CirculationService.returnBook(loanId);
      setMessage({ type: 'success', text: `Trả sách thành công (LoanID: ${loanId}).` });
      setItemBarcode('');
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Lỗi khi trả sách: ' + error.message });
    } finally {
      setLoading(false);
      barcodeInputRef.current?.focus();
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <ScanLine className="text-blue-600" />
          {t('borrow_return')}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Giao diện quét mã vạch tốc độ cao dành cho thủ thư</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/50' : 
          message.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50' : 
          'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle2 /> : message.type === 'warning' ? <AlertTriangle /> : <XCircle />}
            <span className="font-medium text-lg">{message.text}</span>
          </div>
          {message.mockLoanId && (
            <button 
              onClick={() => handleReturn(message.mockLoanId!)}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow transition-colors"
            >
              Thực Hiện Trả Sách Này
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* LEFT PANEL: Patron Info */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1">
            <h2 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-6">
              <User size={20} className="text-indigo-500" /> Thông tin Độc giả
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Mã sinh viên / Quét thẻ</label>
              <input 
                type="text" 
                value={patronId}
                onChange={(e) => setPatronId(e.target.value)}
                onKeyDown={handlePatronKeyDown}
                placeholder="ID..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all"
                autoFocus
              />
            </div>

            {patronData ? (
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <img src={patronData.avatar} alt="Avatar" className="w-24 h-24 rounded-full shadow-md mb-4 border-4 border-white dark:border-slate-700" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{patronData.fullName}</h3>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider mb-6">
                  {patronData.role}
                </span>
                
                <div className="w-full grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Đang mượn</p>
                    <p className="text-2xl font-black text-blue-600">{patronData.activeLoans}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Tiền phạt nợ</p>
                    <p className={`text-xl font-black ${patronData.fines > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {patronData.fines.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <ScanLine size={48} className="mb-4 opacity-50" />
                <p>Chưa có dữ liệu bạn đọc</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Scan Item */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex-1 flex flex-col">
            <h2 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-6">
              <BookOpen size={20} className="text-blue-500" /> Quét mã vạch Sách
            </h2>
            
            <form onSubmit={handleBarcodeSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="w-full max-w-lg mb-8 relative">
                  <input 
                    ref={barcodeInputRef}
                    type="text" 
                    value={itemBarcode}
                    onChange={(e) => setItemBarcode(e.target.value)}
                    placeholder="Quét mã vạch trên tài liệu..."
                    className="w-full px-8 py-6 text-center text-3xl font-mono bg-slate-50 dark:bg-slate-950 border-4 border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-inner"
                    disabled={!patronData || loading}
                  />
                  {!patronData && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                      <span className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium shadow-lg">Vui lòng quét thẻ bạn đọc trước</span>
                    </div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  disabled={!patronData || !itemBarcode || loading}
                  className="px-12 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-full text-xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  {loading ? 'Đang xử lý...' : 'Thực Hiện Mượn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
