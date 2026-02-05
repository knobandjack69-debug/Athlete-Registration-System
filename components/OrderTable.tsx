
import React from 'react';
import { 
  Eye, 
  FileText, 
  Printer, 
  Edit2, 
  Trash2, 
  Loader2, 
  Clock, 
  ImageIcon,
  User,
  Phone
} from 'lucide-react';
import { Order } from '../types';

interface Props {
  orders: Order[];
  onDelete: (order: Order) => void;
  onEdit: (order: Order) => void;
  onView: (order: Order) => void;
  onPrint: (order: Order) => void;
  isDeletingId: string | null;
  hideActions?: boolean;
}

const OrderTable: React.FC<Props> = ({ orders, onDelete, onEdit, onView, onPrint, isDeletingId, hideActions = false }) => {
  /**
   * Helper function: แปลงลิงก์ Google Drive ให้เป็น Direct Link ที่สามารถแสดงผลใน <img> ได้ 100%
   */
  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    
    // กรณีเป็น Base64
    if (url.startsWith('data:')) return url;

    // กรณีเป็นลิงก์ Google Drive
    const driveMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    if (driveMatch && (url.includes('drive.google.com') || url.includes('googleusercontent.com'))) {
      const fileId = driveMatch[1];
      // ใช้ format lh3.googleusercontent.com/d/ID ซึ่งมีความเสถียรในการแสดงผลสูงสุด
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    return url;
  };

  if (orders.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="w-10 h-10 text-slate-200" />
        </div>
        <p className="text-slate-400 font-black text-lg">ยังไม่พบรายการสั่งซื้อในระบบ</p>
        <p className="text-slate-300 text-sm mt-1">เริ่มสร้างคำสั่งซื้อใหม่ได้ที่เมนู "สั่งซื้อใหม่"</p>
      </div>
    );
  }

  const formatThaiDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('th-TH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) + ' น.';
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="overflow-x-auto font-['Sarabun']">
      <table className="w-full text-left border-collapse min-w-[950px]">
        <thead>
          <tr className="bg-slate-50/60 border-b border-slate-100">
            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-28 text-center">รหัสสั่งซื้อ</th>
            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">ชื่อผู้รับ</th>
            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-48">เบอร์โทรศัพท์</th>
            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">วันที่จัดส่ง</th>
            <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-24">รูปภาพ</th>
            {!hideActions && (
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">การจัดการ</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {orders.map((order) => {
            const displayImageUrl = getDirectImageUrl(order.photoUrl);
            
            return (
              <tr key={order.id} className="hover:bg-purple-50/20 transition-all group">
                <td className="px-8 py-5 text-center">
                  <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1.5 rounded-xl shadow-sm tracking-tighter">#{order.id.slice(-6)}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-400 border border-purple-50">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="font-black text-slate-700">{order.recipientName}</div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 font-bold text-slate-500 bg-slate-50 w-fit px-3 py-1.5 rounded-2xl border border-slate-100">
                    <Phone className="w-3.5 h-3.5" />
                    {order.phone}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[13px] font-black text-slate-600">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {formatThaiDate(order.deliveryTime)}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md mx-auto group-hover:scale-110 transition-transform bg-slate-50 flex items-center justify-center">
                    {displayImageUrl ? (
                      <img 
                        src={displayImageUrl} 
                        className="w-full h-full object-cover" 
                        alt="Flower" 
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // ป้องกัน infinite loop
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const icon = document.createElement('div');
                            icon.className = "text-slate-200";
                            icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>';
                            parent.appendChild(icon);
                          }
                        }} 
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-200" />
                    )}
                  </div>
                </td>
                {!hideActions && (
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2.5">
                      {/* View Button - Blue */}
                      <button 
                        onClick={() => onView(order)}
                        title="ดูรายละเอียด" 
                        className="p-3 bg-[#38bdf8] text-white rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200 active:scale-90 transition-all hover:bg-blue-500"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                      {/* PDF Button - Purple (Uses Print) */}
                      <button 
                        onClick={() => onPrint(order)}
                        title="ส่งออก PDF" 
                        className="p-3 bg-[#a855f7] text-white rounded-2xl shadow-lg shadow-purple-100 hover:shadow-purple-200 active:scale-90 transition-all hover:bg-purple-600"
                      >
                        <FileText className="w-4.5 h-4.5" />
                      </button>
                      {/* Print Button - Green */}
                      <button 
                        onClick={() => onPrint(order)}
                        title="พิมพ์ใบสั่งซื้อ" 
                        className="p-3 bg-[#22c55e] text-white rounded-2xl shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-90 transition-all hover:bg-green-600"
                      >
                        <Printer className="w-4.5 h-4.5" />
                      </button>
                      {/* Edit Button - Yellow */}
                      <button onClick={() => onEdit(order)} title="แก้ไขคำสั่งซื้อ" className="p-3 bg-[#eab308] text-white rounded-2xl shadow-lg shadow-yellow-100 hover:shadow-yellow-200 active:scale-90 transition-all hover:bg-yellow-600">
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <div className="w-px h-8 bg-slate-100 mx-1" />
                      <button onClick={() => onDelete(order)} disabled={isDeletingId === order.id} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-30">
                        {isDeletingId === order.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
