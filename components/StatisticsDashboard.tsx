
import React, { useMemo } from 'react';
import { 
  ChartBarBig, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  Package, 
  Clock
} from 'lucide-react';
import { Order } from '../types.ts';

interface Props {
  orders: Order[];
}

const StatisticsDashboard: React.FC<Props> = ({ orders }) => {
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const ordersByDate: Record<string, number> = {};
    orders.forEach(order => {
      try {
        const date = new Date(order.deliveryTime).toLocaleDateString('th-TH', { 
          day: 'numeric', 
          month: 'short' 
        });
        ordersByDate[date] = (ordersByDate[date] || 0) + 1;
      } catch (e) {}
    });

    const sortedDates = Object.entries(ordersByDate)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalOrders,
      ordersByDate,
      topDates: sortedDates
    };
  }, [orders]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 font-['Sarabun']">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="bg-blue-100 p-4 rounded-2xl text-blue-600 relative z-10">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Total Orders</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalOrders} <span className="text-sm text-slate-400 font-bold">รายการ</span></h3>
          </div>
        </div>
        {/* ... เพิ่มการ์ดอื่นๆ ตามต้องการ ... */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-white">
          <div className="flex items-center gap-3 mb-8">
            <ChartBarBig className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-black text-slate-800">สัดส่วนการส่งตามวัน</h3>
          </div>
          <div className="space-y-6">
            {stats.topDates.map(([date, count]) => {
              const percentage = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
              return (
                <div key={date} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-slate-600">{date}</span>
                    <span className="text-xs font-black text-slate-400">{count} ออเดอร์ ({percentage}%)</span>
                  </div>
                  <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* ... ข้อมูลกิจกรรมล่าสุด ... */}
      </div>
    </div>
  );
};

export default StatisticsDashboard;
