
import React from 'react';
import { Order } from '../types.ts';

interface Props {
  order: Order | null;
}

const PrintTemplate: React.FC<Props> = ({ order }) => {
  if (!order) return null;

  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    const driveMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    if (driveMatch && (url.includes('drive.google.com') || url.includes('googleusercontent.com'))) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url;
  };

  return (
    <div id="printable-area" className="p-6 text-slate-900 bg-white min-h-screen font-['Sarabun']">
      <div className="border-[4px] border-slate-900 p-6 rounded-lg relative overflow-hidden">
        {/* Header Decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900 rotate-45 translate-x-12 -translate-y-12"></div>

        {/* Header Section */}
        <div className="flex justify-between items-start border-b-[4px] border-slate-900 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-black uppercase mb-1 tracking-tighter">FLOWER ORDER</h1>
            <p className="text-sm font-bold bg-slate-900 text-white px-3 py-0.5 inline-block">ใบสั่งซื้อสินค้า / ใบเสร็จรับเงิน</p>
          </div>
          <div className="text-right">
            <p className="font-black text-xl">#{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date: {order.timestamp || '-'}</p>
          </div>
        </div>

        {/* Info Grid: Recipient & Schedule */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="space-y-4">
            <h2 className="text-lg font-black border-b-2 border-slate-900 pb-1 uppercase tracking-wider">Recipient Info</h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</p>
                <p className="text-xl font-black leading-none">{order.recipientName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</p>
                <p className="text-xl font-black leading-none">{order.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                <p className="text-sm font-bold leading-tight line-clamp-2">{order.address}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-black border-b-2 border-slate-900 pb-1 uppercase tracking-wider">Schedule & Sample</h2>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Schedule</p>
              <p className="text-lg font-black">
                {new Date(order.deliveryTime).toLocaleString('th-TH', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} น.
              </p>
            </div>
            
            {/* Optimized Image Area */}
            <div className="flex gap-4 items-end">
              <div className="w-28 h-28 border-2 border-slate-900 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                {order.photoUrl ? (
                  <img src={getDirectImageUrl(order.photoUrl)} className="w-full h-full object-cover" alt="Sample" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-200">NO PHOTO</div>
                )}
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase italic">Product Sample Image Reference</p>
            </div>
          </div>
        </div>

        {/* Description Table */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border-2 border-slate-900 p-2 text-left font-black text-sm uppercase tracking-widest">Description / รายละเอียด</th>
                <th className="border-2 border-slate-900 p-2 text-center font-black w-24 text-sm uppercase tracking-widest">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-2 border-slate-900 p-4 font-bold align-top min-h-[100px]">
                  <p className="text-lg mb-4">{order.details}</p>
                  {order.cardMessage && (
                    <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 relative mt-2">
                      <div className="absolute top-0 left-4 -translate-y-1/2 bg-white px-2 font-black text-[9px] text-slate-400 tracking-widest uppercase">Card Message</div>
                      <p className="italic font-serif text-lg text-slate-700 leading-relaxed">"{order.cardMessage}"</p>
                    </div>
                  )}
                </td>
                <td className="border-2 border-slate-900 p-4 text-center font-black text-xl align-top">1 Set</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures Section */}
        <div className="grid grid-cols-2 gap-16 mt-12 pt-4">
          <div className="text-center">
            <div className="border-b-2 border-slate-900 h-10 mb-2"></div>
            <p className="font-black uppercase text-[10px] tracking-widest">Authorized Signature</p>
            <p className="text-[9px] text-slate-400 font-bold">(ผู้จัดทำและจัดส่ง)</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-slate-900 h-10 mb-2"></div>
            <p className="font-black uppercase text-[10px] tracking-widest">Customer Signature</p>
            <p className="text-[9px] text-slate-400 font-bold">(ผู้รับสินค้า)</p>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="mt-8 text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">
          FLOWER ORDERING MANAGEMENT PROFESSIONAL SYSTEM
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
