
import React from 'react';
import { X, User, Phone, Flower, MessageSquare, MapPin, Calendar, ImageIcon, Clock } from 'lucide-react';
import { Order } from '../types.ts';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

// Fix: Return JSX instead of void and add default export to resolve errors in index.tsx and App.tsx
const OrderDetailsModal: React.FC<Props> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const driveMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    if (driveMatch && (url.includes('drive.google.com') || url.includes('googleusercontent.com'))) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url;
  };

  const formatThaiDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('th-TH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) + ' น.';
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 font-['Sarabun']">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black text-slate-800">รายละเอียดคำสั่งซื้อ</h3>
            <p className="text-slate-400 font-bold text-sm">หมายเลขรายการ: #{order.id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="bg-white p-3 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                <div className="flex items-center gap-3 mb-4 text-purple-600">
                  <User className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">ข้อมูลผู้รับ</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-slate-800">{order.recipientName}</p>
                  <p className="flex items-center gap-2 text-slate-500 font-bold">
                    <Phone className="w-4 h-4" /> {order.phone}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                <div className="flex items-center gap-3 mb-4 text-blue-600">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">กำหนดการจัดส่ง</span>
                </div>
                <p className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  {formatThaiDate(order.deliveryTime)}
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-3 mb-4 text-slate-600">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">สถานที่จัดส่ง</span>
                </div>
                <p className="text-slate-700 font-bold leading-relaxed">{order.address}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="aspect-square rounded-[40px] overflow-hidden border-4 border-white shadow-xl bg-slate-100 group">
                {order.photoUrl ? (
                  <img 
                    src={getDirectImageUrl(order.photoUrl)} 
                    alt="Flower" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon className="w-16 h-16 mb-2" />
                    <span className="text-xs font-bold">ไม่มีรูปภาพ</span>
                  </div>
                )}
              </div>

              <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                <div className="flex items-center gap-3 mb-4 text-amber-600">
                  <Flower className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">รายละเอียดสินค้า</span>
                </div>
                <p className="text-slate-700 font-bold leading-relaxed">{order.details}</p>
              </div>
            </div>
          </div>

          {order.cardMessage && (
            <div className="mt-8 bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-16 -mt-16" />
              <div className="flex items-center gap-3 mb-4 opacity-80">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">ข้อความในการ์ด</span>
              </div>
              <p className="text-2xl font-serif italic font-medium leading-relaxed">"{order.cardMessage}"</p>
            </div>
          )}
        </div>
        
        <div className="p-8 bg-slate-50 text-center">
          <button onClick={onClose} className="px-12 py-4 bg-slate-800 text-white rounded-2xl font-black shadow-lg hover:bg-slate-900 transition-all active:scale-95">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
