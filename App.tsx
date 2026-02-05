
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Flower, 
  PlusCircle, 
  Search, 
  List, 
  ChartBarBig, 
  LoaderCircle, 
  RefreshCw, 
  CircleCheckBig, 
  WifiOff,
  X
} from 'lucide-react';
import { Order, OrderFormData } from './types.ts';
import OrderForm from './components/OrderForm.tsx';
import OrderTable from './components/OrderTable.tsx';
import OrderDetailsModal from './components/OrderDetailsModal.tsx';
import PrintTemplate from './components/PrintTemplate.tsx';
import StatisticsDashboard from './components/StatisticsDashboard.tsx';
import DeleteModal from './components/DeleteModal.tsx';
import { orderService } from './orderService.ts';

const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'search' | 'stats'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);
    
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err: any) {
      setFetchError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // กรองข้อมูลตามคำค้นหา
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.recipientName.toLowerCase().includes(term) || 
      order.phone.includes(term) ||
      order.id.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFormSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingOrder) {
        result = await orderService.updateOrder(editingOrder.id, data);
        if (result.success) triggerToast('อัปเดตคำสั่งซื้อสำเร็จ!');
      } else {
        result = await orderService.createOrder(data);
        if (result.success) triggerToast('ยืนยันการสั่งซื้อเรียบร้อย!');
      }

      if (result && result.success) {
        setEditingOrder(null);
        setActiveTab('list');
        fetchOrders(false);
      } else {
        alert('ผิดพลาด: ' + (result?.error || 'ไม่สามารถดำเนินการได้'));
      }
    } catch (err) {
      alert('การเชื่อมต่อล้มเหลว');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await orderService.deleteOrder(deleteTarget.id);
      if (result && result.success) {
        triggerToast('ยกเลิกรายการสั่งซื้อสำเร็จ');
        setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
      } else {
        alert('ไม่สามารถลบรายการได้');
      }
    } catch (err) {
      alert('การเชื่อมต่อล้มเหลว');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] to-[#e0f2fe] pb-10 font-['Sarabun']">
      <PrintTemplate order={printingOrder} />

      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 no-print">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 pt-10 pb-6 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white/90 backdrop-blur-md p-3 rounded-3xl shadow-xl text-purple-600 border border-white/50">
                <Flower className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">ฟอร์มสั่งซื้อ<span className="text-purple-600">ดอกไม้</span></h1>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[11px] bg-white/50 px-4 py-1 rounded-full border border-white/30 backdrop-blur-sm">Flower Ordering System Professional</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button 
              onClick={() => { setActiveTab('create'); setEditingOrder(null); }}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 ${activeTab === 'create' ? 'bg-white text-purple-600 scale-105 border-2 border-purple-100' : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-transparent'}`}
            >
              <PlusCircle className="w-4 h-4" /> สั่งซื้อใหม่
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 ${activeTab === 'search' ? 'bg-[#38bdf8] text-white scale-105 shadow-blue-200' : 'bg-[#e0f2fe]/60 text-blue-700 hover:bg-[#bae6fd] border-2 border-white/50'}`}
            >
              <Search className="w-4 h-4" /> ค้นหาคำสั่งซื้อ
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 ${activeTab === 'list' ? 'bg-[#f1f5f9] text-slate-800 scale-105 border-2 border-white' : 'bg-slate-200/50 text-slate-600 hover:bg-slate-200 border-2 border-white/30'}`}
            >
              <List className="w-4 h-4" /> รายการทั้งหมด
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 ${activeTab === 'stats' ? 'bg-[#f5f3ff] text-purple-600 scale-105 border-2 border-white' : 'bg-purple-100/50 text-purple-500 hover:bg-purple-100 border-2 border-white/30'}`}
            >
              <ChartBarBig className="w-4 h-4" /> รายงานสถิติ
            </button>
          </div>
        </div>
      </header>

      {showToast && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-6 duration-300 no-print">
          <div className="bg-white border border-green-100 shadow-2xl px-8 py-4 rounded-3xl flex items-center gap-3 text-green-600 font-black">
            <CircleCheckBig className="w-6 h-6" /> {toastMsg}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10 no-print">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48 gap-4">
            <div className="relative">
              <LoaderCircle className="w-16 h-16 animate-spin text-purple-600" />
              <Flower className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="font-black text-slate-400 text-lg">กำลังโหลดข้อมูลช่อดอกไม้...</p>
          </div>
        ) : fetchError ? (
          <div className="bg-white/80 backdrop-blur-xl p-16 rounded-[50px] shadow-2xl text-center max-w-lg mx-auto border border-white">
            <WifiOff className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-4">{fetchError}</h3>
            <button onClick={() => fetchOrders()} className="bg-slate-900 text-white px-10 py-4 rounded-3xl font-black shadow-xl transition-all active:scale-95">ลองใหม่อีกครั้ง</button>
          </div>
        ) : (
          <div className="fade-in-up">
            {activeTab === 'create' || editingOrder ? (
              <div className="bg-white/85 backdrop-blur-2xl p-10 md:p-14 rounded-[50px] shadow-2xl border border-white max-w-3xl mx-auto">
                <OrderForm 
                  onSubmit={handleFormSubmit} 
                  isSubmitting={isSubmitting} 
                  editData={editingOrder || undefined}
                  onCancel={() => { setActiveTab('list'); setEditingOrder(null); }}
                />
              </div>
            ) : activeTab === 'stats' ? (
              <StatisticsDashboard orders={orders} />
            ) : (
              <div className="bg-white/85 backdrop-blur-2xl rounded-[50px] shadow-2xl border border-white overflow-hidden">
                <div className="p-10 border-b border-slate-50 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        {activeTab === 'search' ? 'ค้นหาคำสั่งซื้อ' : 'ข้อมูลรายการสั่งซื้อ'}
                      </h2>
                      <p className="text-slate-400 font-bold text-sm">จัดการข้อมูลคำสั่งซื้อและสถานะการจัดส่ง</p>
                    </div>
                    <button onClick={() => fetchOrders(false)} className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-purple-600 transition-all hover:bg-purple-50">
                      <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Search Input Area */}
                  {activeTab === 'search' && (
                    <div className="relative animate-in slide-in-from-left-4 duration-300">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ค้นหาด้วยชื่อผู้รับ หรือ เบอร์โทรศัพท์..."
                        className="w-full pl-16 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:border-blue-200 outline-none font-bold text-slate-700 transition-all shadow-inner"
                      />
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <OrderTable 
                  orders={filteredOrders} 
                  onDelete={(o) => setDeleteTarget(o)} 
                  onEdit={(o) => { setEditingOrder(o); setActiveTab('create'); }} 
                  onView={(o) => setViewingOrder(o)}
                  onPrint={handlePrint}
                  isDeletingId={isDeleting ? deleteTarget?.id || null : null}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <OrderDetailsModal 
        isOpen={!!viewingOrder} 
        order={viewingOrder} 
        onClose={() => setViewingOrder(null)} 
      />

      <DeleteModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="ยกเลิกคำสั่งซื้อ?"
        description={`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อของคุณ ${deleteTarget?.recipientName}? ข้อมูลนี้จะถูกลบถาวร`}
      />
    </div>
  );
};

export default App;
