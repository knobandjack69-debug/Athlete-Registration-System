
import React from 'react';
import { Order } from '../types.ts';

interface Props {
  orders: Order[];
}

const BulkPrintTemplate: React.FC<Props> = ({ orders }) => {
  if (!orders || orders.length === 0) return null;

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
    <div id="printable-area" className="p-0 bg-white font-['Sarabun']">
      {orders.map((order, index) => (
        <div 
          key={order.id} 
          className={`p-10 min-h-screen bg-white ${index !== orders.length - 1 ? 'page-break-after-always border-b-2 border-slate-100' : ''}`}
          style={{ pageBreakAfter: 'always' }}
        >
          <div className="border-4 border-slate-900 p-8 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
              <div>
                <h1 className="text-4xl font-black uppercase mb-1">FLOWER RECEIPT</h1>
                <p className="text-lg font-bold">ใบสั่งซื้อ / ใบเสร็จรับเงิน (Bulk Print)</p>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-bold">วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
              </div>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-2 gap-12 mb-10">
              <div className="space-y-4">
                <h2 className="text-xl font-black border-b-2 border-slate-900 pb-1">ข้อมูลผู้รับ (RECIPIENT)</h2>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Name</p>
                  <p className="text-xl font-black">{order.recipientName}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Phone</p>
                  <p className="text-xl font-black">{order.phone}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-black border-b-2 border-slate-900 pb-1">รายละเอียดจัดส่ง (DELIVERY)</h2>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Scheduled Time</p>
                  <p className="text-xl font-black">{formatThaiDate(order.deliveryTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase">Address</p>
                  <p className="font-bold leading-tight text-sm">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Product with Image Section */}
            <div className="mb-10 flex gap-8">
              <div className="w-1/3">
                <div className="aspect-square border-2 border-slate-900 rounded-xl overflow-hidden bg-slate-50">
                   {order.photoUrl ? (
                     <img 
                       src={getDirectImageUrl(order.photoUrl)} 
                       className="w-full h-full object-cover" 
                       alt="Flower Sample" 
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">NO IMAGE</div>
                   )}
                </div>
                <p className="text-center text-[10px] font-black uppercase mt-2 tracking-widest">Flower Sample Image</p>
              </div>
              
              <div className="w-2/3 border-2 border-slate-900 p-6 rounded-xl">
                <h3 className="text-sm font-black text-slate-400 mb-3 border-b border-slate-100 pb-2 uppercase tracking-widest">Product Details</h3>
                <p className="text-xl font-bold mb-6 text-slate-800">{order.details}</p>
                
                {order.cardMessage && (
                  <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-slate-900 italic">
                    <p className="text-xs font-black text-slate-400 mb-1 not-italic">CARD MESSAGE:</p>
                    <p className="text-lg font-serif">"{order.cardMessage}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-2 gap-20 mt-12">
              <div className="text-center">
                <div className="border-b-2 border-slate-900 h-10 mb-2"></div>
                <p className="font-black text-sm">ผู้จัดทำช่อดอกไม้ / Prepared by</p>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-slate-900 h-10 mb-2"></div>
                <p className="font-black text-sm">ผู้จัดส่ง / Delivered by</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Generated by Flower Ordering Professional System
            </div>
          </div>
        </div>
      ))}
      
      <style>{`
        @media print {
          .page-break-after-always {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkPrintTemplate;
