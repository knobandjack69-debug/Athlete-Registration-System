
import React from 'react';
import { Athlete } from '../types.ts';

interface Props {
  athlete: Athlete | null;
}

const AthletePrintTemplate: React.FC<Props> = ({ athlete }) => {
  if (!athlete) return null;

  return (
    <div id="printable-area" className="p-16 text-slate-900 bg-white">
      <div className="max-w-2xl mx-auto border-[12px] border-double border-slate-800 p-12 relative">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-slate-800 m-4"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-slate-800 m-4"></div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Registration Certificate</h1>
          <p className="text-xl font-bold text-slate-600 uppercase tracking-widest">ใบยืนยันการลงทะเบียนนักกีฬา</p>
          <div className="w-32 h-1.5 bg-slate-800 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="flex gap-12 items-start mb-12">
          <div className="w-48 h-64 border-4 border-slate-800 p-2 shadow-xl bg-slate-50 overflow-hidden">
            {athlete.photoUrl ? (
              <img 
                src={athlete.photoUrl} 
                alt="Athlete" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">NO PHOTO</div>
            )}
          </div>

          <div className="flex-1 space-y-8">
            <div className="border-b-2 border-slate-100 pb-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Athlete Name / ชื่อ-นามสกุล</p>
              <p className="text-3xl font-black text-slate-900">{athlete.firstName} {athlete.lastName}</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="border-b-2 border-slate-100 pb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Grade / ชั้น</p>
                <p className="text-2xl font-black text-slate-900">{athlete.level}</p>
              </div>
              <div className="border-b-2 border-slate-100 pb-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Number / เลขที่</p>
                <p className="text-2xl font-black text-slate-900">{athlete.number}</p>
              </div>
            </div>

            <div className="border-b-2 border-slate-100 pb-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Registration ID / รหัสประจำตัว</p>
              <p className="text-xl font-mono font-black text-slate-800">#{athlete.id.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex justify-between items-end">
          <div className="text-center w-56">
            <div className="border-b-2 border-slate-800 h-10 mb-2"></div>
            <p className="text-xs font-black uppercase">Authorized Signature</p>
            <p className="text-[10px] text-slate-400">(เจ้าหน้าที่รับลงทะเบียน)</p>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase">Printed on: {new Date().toLocaleString('th-TH')}</p>
          </div>
        </div>
      </div>
      
      <p className="text-center mt-12 text-[10px] text-slate-300 uppercase font-black tracking-[0.4em]">Official Athletic Record System</p>
    </div>
  );
};

export default AthletePrintTemplate;
