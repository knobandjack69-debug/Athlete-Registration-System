
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, X, RefreshCw, UserPlus } from 'lucide-react';
import { AthleteFormData, Athlete } from '../types.ts';

interface Props {
  onSubmit: (data: AthleteFormData) => Promise<void>;
  isSubmitting: boolean;
  editData?: Athlete;
  onCancel?: () => void;
}

const RegistrationForm: React.FC<Props> = ({ onSubmit, isSubmitting, editData, onCancel }) => {
  const [formData, setFormData] = useState<AthleteFormData>({
    firstName: '',
    lastName: '',
    level: '',
    number: '',
    photoUrl: '',
  });
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        firstName: editData.firstName,
        lastName: editData.lastName,
        level: editData.level,
        number: editData.number,
        photoUrl: editData.photoUrl,
      });
      setPreview(editData.photoUrl);
    } else {
      setFormData({ firstName: '', lastName: '', level: '', number: '', photoUrl: '' });
      setPreview(null);
    }
  }, [editData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setFormData(prev => ({ ...prev, photoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    setFormData(prev => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photoUrl) {
      alert('กรุณาอัปโหลดรูปภาพนักกีฬา');
      return;
    }
    await onSubmit(formData);
    if (!editData) {
      setFormData({ firstName: '', lastName: '', level: '', number: '', photoUrl: '' });
      setPreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center">
        <div className="relative group">
          <div 
            className={`w-40 h-40 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden cursor-pointer relative ${
              preview ? 'border-blue-500 ring-4 ring-blue-50 shadow-inner' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-300'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="text-center p-4">
                <Camera className="text-slate-400 w-10 h-10 mx-auto mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Click to Upload<br/>Photo</p>
              </div>
            )}
            
            {preview && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="text-white w-8 h-8" />
              </div>
            )}
          </div>
          
          {preview && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearPhoto(); }}
              className="absolute -top-1 -right-1 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-10 hover:scale-110 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อ</label>
            <input
              required
              type="text"
              name="firstName"
              placeholder="กรอกชื่อ"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none bg-slate-50/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">นามสกุล</label>
            <input
              required
              type="text"
              name="lastName"
              placeholder="กรอกนามสกุล"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none bg-slate-50/50"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชั้น</label>
            <select
              required
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">เลือกชั้น</option>
              {['ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">เลขที่</label>
            <input
              required
              type="number"
              name="number"
              placeholder="00"
              value={formData.number}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <button
          disabled={isSubmitting}
          type="submit"
          className={`w-full py-4 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center gap-2 group ${
            editData 
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200/50 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200/50 text-white'
          } active:scale-[0.98] disabled:opacity-70`}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : editData ? (
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
          <span>{isSubmitting ? 'กำลังบันทึกข้อมูล...' : editData ? 'ยืนยันการแก้ไขข้อมูล' : 'ลงทะเบียนนักกีฬา'}</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all text-sm uppercase tracking-widest border border-transparent hover:border-slate-100"
          >
            ยกเลิกและกลับ
          </button>
        )}
      </div>
    </form>
  );
};

export default RegistrationForm;
