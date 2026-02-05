
import React from 'react';
import { Order } from '../types';

interface Props {
  order: Order | null;
}

const PrintTemplate: React.FC<Props> = ({ order }) => {
  if (!order) return null;

  return (
    <div id="printable-area" className="p-10 text-slate-900 bg-white min-h-screen">
      <div className="border-4 border-slate-900 p-8 rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase mb-1">FLOWER RECEIPT</h1>
            <p className="text-lg font-bold">ใบสั่งซื้อ / ใบเสร็จรับเงิน</p>
          </div>
          <div className="text-right">
            <p className="font-black text-2xl">#{order.id.slice(-8)}</p>
            <p className="text-sm font-bold">วันที่สั่งซื้อ: {order.timestamp || '-'}</p>
          </div>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div className="space-y-4">
            <h2 className="text-xl font-black border-b-2 border-slate-900 pb-1">CUSTOMER INFO</h2>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Recipient Name</p>
              <p className="text-xl font-black">{order.recipientName}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Phone Number</p>
              <p className="text-xl font-black">{order.phone}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-black border-b-2 border-slate-900 pb-1">DELIVERY INFO</h2>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Delivery Date/Time</p>
              <p className="text-xl font-black">
                {new Date(order.deliveryTime).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Shipping Address</p>
              <p className="font-bold leading-tight">{order.address}</p>
            </div>
          </div>
        </div>

        {/* Order Details Table */}
        <div className="mb-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="border border-slate-900 p-3 text-left font-black">DESCRIPTION (รายละเอียดสินค้า)</th>
                <th className="border border-slate-900 p-3 text-center font-black w-32">QTY</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-900 p-4 font-bold align-top min-h-[100px]">
                  <p className="text-lg">{order.details}</p>
                  {order.cardMessage && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                      <p className="text-sm font-black text-slate-400 mb-1">CARD MESSAGE:</p>
                      <p className="italic font-bold">"{order.cardMessage}"</p>
                    </div>
                  )}
                </td>
                <td className="border border-slate-900 p-4 text-center font-black text-xl">1 ชุด</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-20 mt-20 pt-10">
          <div className="text-center">
            <div className="border-b-2 border-slate-900 h-10 mb-2"></div>
            <p className="font-black">ผู้จัดส่ง / Delivery by</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-slate-900 h-10 mb-2"></div>
            <p className="font-black">ผู้รับสินค้า / Received by</p>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Thank you for choosing our flower service
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
