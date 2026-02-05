
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
    <div id="printable-area" className="p-10 text-slate-900 bg-white min-h-screen font-['Sarabun']">
      <div className="border-[6px] border-slate-900 p-10 rounded-lg relative overflow-hidden">
        {/* Header Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 rotate-45 translate-x-16 -translate-y-16"></div>

        {/* Header */}
        <div className="flex justify-between items-start border-b-[6px] border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-5xl font-black uppercase mb-2 tracking-tighter">FLOWER ORDER</h1>
            <p className="text-xl font-bold bg-slate-900 text-white px-4 py-1 inline-block">ใบสั่งซื้อสินค้า / ใบเสร็จรับเงิน</p>
          </div>
          <div className="text-right">
            <p className="font-black text-3xl">#{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm font-bold text-slate-400">ORDERED DATE: {order.timestamp || '-'}</p>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-2 gap-16 mb-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-black border-b-4 border-slate-900 pb-2 uppercase">Recipient Info</h2>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Customer Name</p>
              <p className="text-2xl font-black">{order.recipientName}</p>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
              <p className="text-2xl font-black">{order.phone}</p>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Address</p>
              <p className="text-lg font-bold leading-tight">{order.address}</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-black border-b-4 border-slate-900 pb-2 uppercase">Schedule</h2>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Date/Time</p>
              <p className="text-2xl font-black">
                {new Date(order.deliveryTime).toLocaleString('th-TH', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} น.
              </p>
            </div>
            
            {/* Added Image Section in Single Print */}
            <div className="pt-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Product Sample</p>
              <div className="w-full aspect-video border-2 border-slate-900 rounded-xl overflow-hidden bg-slate-50">
                {order.photoUrl ? (
                  <img src={getDirectImageUrl(order.photoUrl)} className="w-full h-full object-cover" alt="Flower Sample" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200 font-black">NO PHOTO</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Table */}
        <div className="mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border-2 border-slate-900 p-4 text-left font-black text-lg uppercase">Description / รายละเอียดสินค้า</th>
                <th className="border-2 border-slate-900 p-4 text-center font-black w-40 text-lg uppercase">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-2 border-slate-900 p-6 font-bold align-top">
                  <p className="text-2xl mb-6">{order.details}</p>
                  {order.cardMessage && (
                    <div className="mt-6 p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 relative">
                      <div className="absolute top-0 left-6 -translate-y-1/2 bg-white px-4 font-black text-xs text-slate-400 tracking-widest uppercase">Card Message</div>
                      <p className="italic font-serif text-2xl text-slate-800">"{order.cardMessage}"</p>
                    </div>
                  )}
                </td>
                <td className="border-2 border-slate-900 p-6 text-center font-black text-3xl">1 Set</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-24 mt-24 pt-10">
          <div className="text-center">
            <div className="border-b-2 border-slate-900 h-12 mb-3"></div>
            <p className="font-black uppercase text-sm">Prepared & Delivered by</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-slate-900 h-12 mb-3"></div>
            <p className="font-black uppercase text-sm">Customer Signature</p>
          </div>
        </div>

        <div className="mt-16 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
          Professional Flower Ordering System Management
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
