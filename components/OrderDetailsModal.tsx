
import React from 'react';
import { X, User, Phone, Flower, MessageSquare, MapPin, Calendar, ImageIcon } from 'lucide-react';
import { Order } from '../types';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<Props> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const driveMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    if (driveMatch) return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    return url;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <span className="text-[10px] font-black bg-purple-600 text-white px-3 py-1 rounded-full mb-1 inline-block">ORDER DETAILS</span>
            <h3 className="text-2xl font-black text-slate-800">รหัสสั่งซื้อ #{order.id.slice(-6)}</h3>
          </div>
          <button onClick={onClose} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> รูปภาพตัวอย่าง
              </label>
              <div className="aspect-square rounded-[30px] overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-inner">
                <img 
                  src={getDirectImageUrl(order.photoUrl)} 
                  className="w-full h-full object-cover" 
                  alt="Order Preview" 
                  onError={(e) => e.currentTarget.src = 'https://ui-avatars.com/api/?name=F&background=eee'}
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4" /> ผู้รับ
                </label>
                <p className="text-lg font-black text-slate-800">{order.recipientName}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-4 h-4" /> เบอร์โทรศัพท์
                </label>
                <p className="text-lg font-bold text-slate-600">{order.phone}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> กำหนดส่ง
                </label>
                <p className="text-lg font-bold text-slate-600">
                  {new Date(order.deliveryTime).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })} น.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Flower className="w-4 h-4 text-purple-500" /> รายละเอียดช่อดอกไม้
              </label>
              <p className="text-slate-700 font-bold leading-relaxed">{order.details}</p>
            </div>

            <div className="p-6 bg-purple-50 rounded-3xl space-y-2 border border-purple-100">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> ข้อความในการ์ด
              </label>
              <p className="text-purple-900 font-black italic text-lg leading-relaxed">"{order.cardMessage || 'ไม่มีข้อความ'}"</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-500" /> ที่อยู่จัดส่ง
              </label>
              <p className="text-slate-700 font-bold leading-relaxed">{order.address}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
          <button 
            onClick={onClose}
            className="px-10 py-3 rounded-2xl bg-slate-800 text-white font-black shadow-lg shadow-slate-200 active:scale-95 transition-all"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
