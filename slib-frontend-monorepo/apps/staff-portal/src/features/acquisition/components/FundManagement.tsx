import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@slib/api-client';
import { Wallet, Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface Fund {
  id: number;
  name: string;
  code: string;
  totalBudget: number;
  committedAmount: number;
  spentAmount: number;
  availableBalance: number;
}

export const FundManagement: React.FC = () => {
  const { t } = useTranslation();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFunds = async () => {
    try {
      const res = await api.get('/api/fund');
      setFunds(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Wallet className="text-primary-500" />
            {t('funds')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('fund_desc')}
          </p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
          <Plus size={18} />
          {t('add_fund')}
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading funds...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {funds.map(fund => (
            <div key={fund.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{fund.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{fund.code}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">
                    {t('available_balance')}
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(fund.availableBalance)}
                  </div>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                  <Activity size={16} className="mx-auto mb-1 text-primary-500" />
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('total_budget')}</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(fund.totalBudget)}</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg">
                  <TrendingUp size={16} className="mx-auto mb-1 text-amber-500" />
                  <div className="text-xs text-amber-600 dark:text-amber-500 mb-1">{t('committed_amount')}</div>
                  <div className="font-bold text-amber-700 dark:text-amber-400">{formatCurrency(fund.committedAmount)}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                  <TrendingDown size={16} className="mx-auto mb-1 text-red-500" />
                  <div className="text-xs text-red-600 dark:text-red-500 mb-1">{t('spent_amount')}</div>
                  <div className="font-bold text-red-700 dark:text-red-400">{formatCurrency(fund.spentAmount)}</div>
                </div>
              </div>
            </div>
          ))}
          {funds.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <Wallet size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Chưa có quỹ ngân sách nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
