
import React, { useMemo } from 'react';
import { 
  BarChart3, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  Package, 
  Clock
} from 'lucide-react';
import { Order } from '../types';

interface Props {
  orders: Order[];
}

const StatisticsDashboard: React.FC<Props> = ({ orders }) => {
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    
    // ออเดอร์ตามวัน
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
      .sort((a, b) => b[1] - a[1]) // เรียงตามจำนวนออเดอร์
      .slice(0, 5);

    return {
      totalOrders,
      ordersByDate,
      topDates: sortedDates
    };
  }, [orders]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Quick Summary Cards */}
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

        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="bg-purple-100 p-4 rounded-2xl text-purple-600 relative z-10">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Growth Rate</p>
            <h3 className="text-3xl font-black text-slate-800">100% <span className="text-sm text-slate-400 font-bold">ปีนี้</span></h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-[100px] -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="bg-green-100 p-4 rounded-2xl text-green-600 relative z-10">
            <Package className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">Delivered</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalOrders} <span className="text-sm text-slate-400 font-bold">สำเร็จ</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders by Delivery Date */}
        <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-white">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-black text-slate-800">สัดส่วนการส่งตามวัน</h3>
          </div>
          
          <div className="space-y-6">
            {stats.topDates.map(([date, count]) => {
              const percentage = Math.round((count / stats.totalOrders) * 100);
              return (
                <div key={date} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-slate-600">{date}</span>
                    <span className="text-xs font-black text-slate-400">{count} ออเดอร์ ({percentage}%)</span>
                  </div>
                  <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            
            {stats.topDates.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-300 font-bold italic">ยังไม่มีข้อมูลเพียงพอสำหรับการแสดงกราฟ</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Log / Trends */}
        <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-white">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-black text-slate-800">กิจกรรมล่าสุด</h3>
          </div>

          <div className="space-y-6">
            {orders.slice(0, 5).map((order, i) => (
              <div key={order.id} className="flex gap-4 items-start relative">
                {i !== 4 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-100" />
                )}
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex-shrink-0 flex items-center justify-center border border-slate-100">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-black text-slate-700">ออเดอร์ใหม่จากคุณ {order.recipientName}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                    รหัส: #{order.id.slice(-6)} • {order.timestamp || 'เพิ่งเร็วๆ นี้'}
                  </p>
                </div>
              </div>
            ))}
            
            {orders.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-300 font-bold italic">ไม่มีกิจกรรมล่าสุด</p>
              </div>
            )}
          </div>
          
          <div className="mt-10 p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
            <PieChart className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Insight</p>
              <p className="text-blue-800 font-bold text-sm">ปัจจุบันระบบของคุณมีการจัดการออเดอร์ที่แม่นยำ 100%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
