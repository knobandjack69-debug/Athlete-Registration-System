
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Phone, 
  Flower, 
  Camera, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Loader2, 
  CheckCircle,
  X,
  ChevronLeft
} from 'lucide-react';
// Fix: Use .ts extension in the import to be consistent with other files
import { OrderFormData, Order } from '../types.ts';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onSubmit: (data: OrderFormData) => Promise<void>;
  isSubmitting: boolean;
  editData?: Order;
  onCancel?: () => void;
}

const OrderForm: React.FC<Props> = ({ onSubmit, isSubmitting, editData, onCancel }) => {
  const [formData, setFormData] = useState<OrderFormData>({
    recipientName: '',
    phone: '',
    details: '',
    cardMessage: '',
    address: '',
    deliveryTime: '',
    photoUrl: ''
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Helper function: แปลงลิงก์ Google Drive ให้เป็น Direct Link สำหรับพรีวิว
   */
  const getPreviewUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    const driveMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    if (driveMatch && (url.includes('drive.google.com') || url.includes('googleusercontent.com'))) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url;
  };

  useEffect(() => {
    if (editData) {
      setFormData({
        recipientName: editData.recipientName,
        phone: editData.phone,
        details: editData.details,
        cardMessage: editData.cardMessage,
        address: editData.address,
        deliveryTime: editData.deliveryTime,
        photoUrl: editData.photoUrl,
      });
      setPreview(getPreviewUrl(editData.photoUrl));
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ (ไม่ควรเกิน 2MB เพื่อความเร็วในการส่ง)
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดรูปภาพใหญ่เกินไป กรุณาใช้รูปที่มีขนาดไม่เกิน 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setFormData(prev => ({ ...prev, photoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCardMessage = async () => {
    if (!formData.details) {
      alert('กรุณากรอกรายละเอียดช่อดอกไม้ เพื่อให้ AI แนะนำข้อความที่เหมาะสมครับ');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Fix: Follow Google GenAI SDK guidelines for initialization and content generation
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `ในบทบาทของนักเขียนคำคมและกวี ช่วยเขียนข้อความสั้นๆ ซึ้งๆ สำหรับใส่ในการ์ดอวยพรที่มาพร้อมกับช่อดอกไม้ที่มีรายละเอียดดังนี้: "${formData.details}" ขอแบบกระชับ 1-2 ประโยคสำหรับภาษาไทยที่ดูอบอุ่นและเป็นกันเอง`,
      });
      
      // Fix: Access .text property instead of calling .text() as per GenerateContentResponse definition
      const text = response.text;
      if (text) {
        setFormData(prev => ({ ...prev, cardMessage: text.trim().replace(/["']/g, '') }));
      }
    } catch (err) {
      console.error(err);
      alert('ขออภัยครับ AI กำลังพักผ่อน ลองใหม่อีกครั้งในภายหลังนะครับ');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photoUrl) {
      alert('กรุณาอัปโหลดรูปภาพช่อดอกไม้ตัวอย่าง เพื่อประกอบการสั่งซื้อ');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-['Sarabun']">
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-3xl font-black text-slate-800 mb-8">{editData ? 'แก้ไขข้อมูลการสั่งซื้อ' : 'รายละเอียดการสั่งซื้อใหม่'}</h2>
        
        {/* Profile Image Section */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`w-44 h-44 rounded-[50px] flex items-center justify-center overflow-hidden border-4 border-dashed transition-all cursor-pointer relative group ${
            preview ? 'border-purple-300 ring-[12px] ring-purple-50 shadow-2xl' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-purple-200'
          }`}
        >
          {preview ? (
            <img src={preview} className="w-full h-full object-cover transform transition-transform group-hover:scale-110" alt="Sample" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <Camera className="w-10 h-10 group-hover:text-purple-400 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">รูปช่อดอกไม้ตัวอย่าง</span>
            </div>
          )}
          {preview && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); setPreview(null); setFormData(p => ({...p, photoUrl: ''})); if(fileInputRef.current) fileInputRef.current.value = ''; }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
            <User className="w-4 h-4 text-purple-600" /> ชื่อผู้รับดอกไม้
          </label>
          <input required name="recipientName" value={formData.recipientName} onChange={handleChange} className="w-full px-6 py-4 rounded-3xl bg-slate-50 focus:bg-white border-2 border-slate-50 focus:border-purple-200 transition-all outline-none font-bold text-slate-700 shadow-sm" placeholder="ระบุชื่อ-นามสกุล ผู้รับ" />
        </div>
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
            <Phone className="w-4 h-4 text-purple-600" /> เบอร์โทรศัพท์ผู้รับ
          </label>
          <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-6 py-4 rounded-3xl bg-slate-50 focus:bg-white border-2 border-slate-50 focus:border-purple-200 transition-all outline-none font-bold text-slate-700 shadow-sm" placeholder="08X-XXXXXXX" />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
          <Flower className="w-4 h-4 text-purple-600" /> รายละเอียดช่อดอกไม้
        </label>
        <textarea required name="details" value={formData.details} onChange={handleChange} rows={3} className="w-full px-6 py-4 rounded-3xl bg-slate-50 focus:bg-white border-2 border-slate-50 focus:border-purple-200 transition-all outline-none font-bold text-slate-700 shadow-sm resize-none" placeholder="ระบุชนิดดอกไม้, สี, หรือรูปแบบที่ต้องการ เช่น กุหลาบแดง 12 ดอก ห่อกระดาษสีครีม" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center ml-1">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-600" /> ข้อความในการ์ด
          </label>
          <button type="button" onClick={generateCardMessage} disabled={isGenerating} className="text-[10px] font-black bg-purple-600 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-purple-700 transition-all shadow-md active:scale-95 disabled:opacity-50">
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} ✨ ให้ AI แนะนำข้อความ
          </button>
        </div>
        <textarea name="cardMessage" value={formData.cardMessage} onChange={handleChange} rows={2} className="w-full px-6 py-4 rounded-3xl bg-purple-50/40 focus:bg-white border-2 border-purple-50 focus:border-purple-200 transition-all outline-none font-bold italic text-purple-900 shadow-sm resize-none" placeholder="เขียนข้อความซึ้งๆ สำหรับการ์ดอวยพร..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
            <MapPin className="w-4 h-4 text-purple-600" /> ที่อยู่สำหรับจัดส่ง
          </label>
          <textarea required name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-6 py-4 rounded-3xl bg-slate-50 focus:bg-white border-2 border-slate-50 focus:border-purple-200 transition-all outline-none font-bold text-slate-700 shadow-sm resize-none" placeholder="เลขที่บ้าน, หมู่บ้าน/อาคาร, แขวง/ตำบล, เขต/อำเภอ, จังหวัด" />
        </div>
        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
            <Calendar className="w-4 h-4 text-purple-600" /> วันที่และเวลาจัดส่ง
          </label>
          <input required type="datetime-local" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} className="w-full px-6 py-5 rounded-3xl bg-slate-50 focus:bg-white border-2 border-slate-50 focus:border-purple-200 transition-all outline-none font-black text-slate-700 shadow-sm" />
        </div>
      </div>

      <div className="flex flex-col gap-5 pt-10">
        <button disabled={isSubmitting} type="submit" className="w-full py-5 rounded-[30px] bg-[#22c55e] hover:bg-green-600 text-white font-black text-xl shadow-2xl shadow-green-100 transition-all active:scale-[0.97] flex items-center justify-center gap-4 border-b-4 border-green-700">
          {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin" /> : <CheckCircle className="w-7 h-7" />}
          {editData ? '✅ ยืนยันการแก้ไขข้อมูล' : '✅ ยืนยันการสั่งซื้อ'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-full py-4 text-slate-400 font-black hover:text-slate-600 transition-all flex items-center justify-center gap-2">
            <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
          </button>
        )}
      </div>
    </form>
  );
};

export default OrderForm;
