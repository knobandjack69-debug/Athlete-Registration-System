
import React from 'react';
import { Trash2, Edit2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Athlete } from '../types';

interface Props {
  athletes: Athlete[];
  onDelete: (athlete: Athlete) => void;
  onEdit: (athlete: Athlete) => void;
  isDeletingId: string | null;
  hideActions?: boolean;
}

const AthleteTable: React.FC<Props> = ({ athletes, onDelete, onEdit, isDeletingId, hideActions = false }) => {
  if (athletes.length === 0) {
    return (
      <div className="p-20 text-center bg-white rounded-3xl no-print">
        <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-400">ยังไม่พบข้อมูลนักกีฬาในระบบ</h3>
        <p className="text-slate-400 text-sm">กรุณากรอกแบบฟอร์มลงทะเบียนเพื่อเพิ่มข้อมูลใหม่</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px] print:min-w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16 print:text-black print:font-bold">ลำดับ</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24 print:text-black print:font-bold">รูปภาพ</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black print:font-bold">ชื่อ - นามสกุล</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32 print:text-black print:font-bold">ชั้น / เลขที่</th>
            {!hideActions && (
              <th className="no-print px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32 col-action">จัดการ</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {athletes.map((athlete, index) => (
            <tr key={athlete.id} className="group hover:bg-slate-50/50 transition-colors duration-200 print:hover:bg-transparent">
              <td className="px-6 py-4 text-center text-slate-400 font-bold text-sm print:text-black">
                {index + 1}
              </td>
              <td className="px-6 py-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white ring-2 ring-slate-100 mx-auto bg-slate-50 shadow-sm transition-transform group-hover:scale-110 print:ring-0 print:border-none">
                  <img 
                    src={athlete.photoUrl || 'https://via.placeholder.com/100?text=Athlete'} 
                    alt="Athlete" 
                    className="w-full h-full object-cover athlete-photo-circle athlete-photo-print"
                    loading="lazy"
                  />
                </div>
              </td>
              <td className="px-6 py-4 font-bold text-slate-700 print:text-black">
                <div className="text-base">{athlete.firstName} {athlete.lastName}</div>
                <div className="text-[9px] text-slate-300 font-mono tracking-tighter uppercase no-print">UID: {athlete.id}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 w-fit print:bg-transparent print:border-none print:text-black print:text-sm">
                    ชั้น {athlete.level}
                   </span>
                   <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 w-fit print:bg-transparent print:border-none print:text-black print:text-sm">
                    เลขที่ {athlete.number}
                   </span>
                </div>
              </td>
              {!hideActions && (
                <td className="no-print px-6 py-4 col-action">
                  <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(athlete)}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-amber-100"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(athlete)}
                      disabled={isDeletingId === athlete.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-red-100 shadow-sm"
                      title="ลบข้อมูล"
                    >
                      {isDeletingId === athlete.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AthleteTable;
