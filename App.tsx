
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Flower, 
  PlusCircle, 
  Search, 
  History, 
  BarChart3, 
  Loader2, 
  RefreshCw, 
  CheckCircle2, 
  WifiOff,
  X,
  Printer,
  CheckSquare,
  Square,
  ChevronRight,
  Layers,
  MousePointer2
} from 'lucide-react';
import { Order, OrderFormData } from './types.ts';
import OrderForm from './components/OrderForm.tsx';
import OrderTable from './components/OrderTable.tsx';
import OrderDetailsModal from './components/OrderDetailsModal.tsx';
import StatisticsDashboard from './components/StatisticsDashboard.tsx';
import PrintTemplate from './components/PrintTemplate.tsx';
import BulkPrintTemplate from './components/BulkPrintTemplate.tsx';
import DeleteModal from './components/DeleteModal.tsx';
import { orderService } from './orderService.ts';

const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'stats' | 'search'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [bulkPrintingOrders, setBulkPrintingOrders] = useState<Order[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Selection state for bulk printing
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);
    
    try {
      const data = await orderService.getOrders();
      if (data) {
        setOrders(data);
      } else {
        throw new Error('No data returned');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setFetchError('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ (Failed to fetch)\nกรุณาตรวจสอบการตั้งค่า "Anyone" ในการ Deploy GAS');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(o => 
      o.recipientName.toLowerCase().includes(term) || 
      o.id.toLowerCase().includes(term) ||
      o.phone.includes(term)
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
        if (result.success) triggerToast('แก้ไขข้อมูลสำเร็จแล้ว!');
      } else {
        result = await orderService.createOrder(data);
        if (result.success) triggerToast('บันทึกคำสั่งซื้อใหม่เรียบร้อย!');
      }

      if (result && result.success) {
        setEditingOrder(null);
        setActiveTab('list');
        fetchOrders(false);
      } else {
        alert('เกิดข้อผิดพลาด: ' + (result?.error || 'ไม่สามารถบันทึกข้อมูลได้'));
      }
    } catch (err) {
      alert('การเชื่อมต่อล้มเหลว กรุณาลองใหม่');
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
        triggerToast('ลบรายการสั่งซื้อสำเร็จ');
        setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
      } else {
        alert('ไม่สามารถลบข้อมูลได้');
      }
    } catch (err) {
      alert('การเชื่อมต่อล้มเหลว');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const newIds = new Set(selectedOrderIds);
    filteredOrders.forEach(o => newIds.add(o.id));
    setSelectedOrderIds(newIds);
  };

  const deselectAllFiltered = () => {
    const newIds = new Set(selectedOrderIds);
    filteredOrders.forEach(o => newIds.delete(o.id));
    setSelectedOrderIds(newIds);
  };

  const handlePrintAll = () => {
    if (orders.length === 0) {
      alert('ไม่มีรายการให้พิมพ์');
      return;
    }
    setBulkPrintingOrders(orders);
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
      setBulkPrintingOrders([]);
    }, 800);
  };

  const handlePrintSelected = () => {
    if (selectedOrderIds.size === 0) {
      alert('กรุณาเลือกอย่างน้อย 1 รายการ');
      return;
    }
    const selected = orders.filter(o => selectedOrderIds.has(o.id));
    setBulkPrintingOrders(selected);
    setTimeout(() => {
      window.print();
      setBulkPrintingOrders([]);
      setIsSelectionMode(false);
      setSelectedOrderIds(new Set());
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] pb-20 font-['Sarabun']">
      <PrintTemplate order={printingOrder} />
      <BulkPrintTemplate orders={bulkPrintingOrders} />

      {/* Modern Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white pt-12 pb-24 px-6 relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-900/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Flower className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">ระบบสั่งซื้อ<span className="text-pink-200">ดอกไม้</span></h1>
              </div>
              <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px]">Professional Flower Management Tool</p>
            </div>
            
            <div className="flex flex-wrap justify-center bg-white/10 backdrop-blur-md p-2 rounded-[32px] border border-white/20 gap-2">
              <button 
                onClick={() => { setActiveTab('list'); setEditingOrder(null); setIsSelectionMode(false); }}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === 'list' && !isSelectionMode ? 'bg-white text-rose-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
              >
                <History className="w-5 h-5" /> รายการสั่งซื้อ
              </button>
              <button 
                onClick={() => { setActiveTab('create'); setEditingOrder(null); setIsSelectionMode(false); }}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === 'create' ? 'bg-white text-rose-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
              >
                <PlusCircle className="w-5 h-5" /> สั่งซื้อใหม่
              </button>
              <button 
                onClick={() => { setActiveTab('search'); setIsSelectionMode(false); }}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === 'search' ? 'bg-white text-rose-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
              >
                <Search className="w-5 h-5" /> ค้นหา
              </button>
              <button 
                onClick={() => { setActiveTab('stats'); setIsSelectionMode(false); }}
                className={`flex items-center gap-2 px-6 py-4 rounded-[24px] font-black text-sm transition-all ${activeTab === 'stats' ? 'bg-white text-rose-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
              >
                <BarChart3 className="w-5 h-5" /> สถิติ
              </button>
            </div>
          </div>
        </div>
      </header>

      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 no-print">
          <div className="bg-white border-2 border-green-500 shadow-2xl px-8 py-4 rounded-[24px] flex items-center gap-3 text-green-600 font-black">
            <CheckCircle2 className="w-6 h-6" /> {toastMsg}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 -mt-12 no-print relative z-20">
        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-[48px] p-24 shadow-2xl flex flex-col items-center justify-center gap-6 border border-white">
            <div className="relative">
              <div className="w-20 h-20 border-8 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
              <Flower className="w-8 h-8 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="font-black text-slate-400 text-lg">กำลังโหลดข้อมูล...</p>
          </div>
        ) : fetchError ? (
          <div className="bg-white rounded-[48px] p-16 shadow-2xl text-center border-2 border-red-50">
            <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <WifiOff className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-4 whitespace-pre-line">{fetchError}</h3>
            <button onClick={() => fetchOrders()} className="bg-rose-500 text-white px-10 py-5 rounded-[24px] font-black shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all flex items-center gap-3 mx-auto">
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} /> ลองใหม่
            </button>
          </div>
        ) : (
          <div className="fade-in">
            {activeTab === 'create' || editingOrder ? (
              <div className="bg-white p-10 md:p-16 rounded-[48px] shadow-2xl border border-white max-w-4xl mx-auto">
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
              <div className="bg-white rounded-[48px] shadow-2xl border border-white overflow-hidden">
                
                {/* Mode: Selection */}
                {isSelectionMode ? (
                  <div className="bg-slate-900 text-white p-8 flex flex-col md:flex-row justify-between items-center gap-6 animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-5">
                      <button onClick={() => { setIsSelectionMode(false); setSelectedOrderIds(new Set()); }} className="bg-white/10 p-3 hover:bg-white/20 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                      </button>
                      <div>
                        <h3 className="text-2xl font-black">ระบุรายการที่จะพิมพ์</h3>
                        <p className="text-rose-400 text-sm font-bold">เลือกแล้ว {selectedOrderIds.size} รายการ</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button onClick={selectAllFiltered} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black hover:bg-white/10 transition-all">เลือกทั้งหมดที่เห็น</button>
                      <button onClick={deselectAllFiltered} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black hover:bg-white/10 transition-all">ยกเลิกที่เลือกไว้</button>
                      <button 
                        onClick={handlePrintSelected}
                        disabled={selectedOrderIds.size === 0}
                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-[20px] font-black shadow-2xl shadow-green-500/20 flex items-center gap-3 transition-all active:scale-95 ml-2"
                      >
                        <Printer className="w-6 h-6" /> พิมพ์รายการที่เลือก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800">
                        {activeTab === 'search' ? 'ผลการค้นหา' : 'ประวัติการสั่งซื้อ'}
                      </h2>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Order Management Center</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      {(activeTab === 'search' || searchTerm) && (
                        <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                          <input 
                            type="text" 
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ค้นหา..."
                            className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-[20px] focus:bg-white focus:border-rose-200 outline-none font-bold text-slate-600 shadow-inner transition-all text-sm"
                          />
                          {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setShowPrintModal(true)}
                        className="bg-rose-500 text-white px-8 py-4 rounded-[20px] font-black shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all flex items-center gap-3"
                      >
                        <Printer className="w-6 h-6" /> พิมพ์รายการ
                      </button>

                      <button 
                        onClick={() => fetchOrders(false)} 
                        className="bg-slate-50 p-4 rounded-2xl text-slate-400 hover:text-rose-600 transition-all hover:bg-rose-50 border border-slate-100"
                      >
                        <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                )}
                
                <OrderTable 
                  orders={filteredOrders} 
                  onDelete={(o) => setDeleteTarget(o)} 
                  onEdit={(o) => { setEditingOrder(o); setActiveTab('create'); }} 
                  onView={(o) => setViewingOrder(o)}
                  onPrint={(o) => { setPrintingOrder(o); setTimeout(() => window.print(), 300); }}
                  isDeletingId={isDeleting ? deleteTarget?.id || null : null}
                  selectionMode={isSelectionMode}
                  selectedIds={selectedOrderIds}
                  onToggleOrder={toggleOrderSelection}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Print Options Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="p-10 pb-0 flex justify-between items-start">
              <div>
                <div className="bg-rose-50 w-16 h-16 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
                  <Printer className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">เลือกรูปแบบการพิมพ์</h3>
                <p className="text-slate-400 font-bold">คุณต้องการพิมพ์รายการสั่งซื้ออย่างไร?</p>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-300 hover:text-slate-500 transition-colors p-2">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="p-10 space-y-4">
              <button 
                onClick={handlePrintAll}
                className="w-full flex items-center gap-6 p-6 rounded-[32px] border-2 border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition-all group text-left"
              >
                <div className="bg-white w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-800">พิมพ์ทั้งหมด ({orders.length} รายการ)</p>
                  <p className="text-sm font-bold text-slate-400">ระบบจะดึงข้อมูลทุกรายการในฐานข้อมูลมาพิมพ์</p>
                </div>
              </button>

              <button 
                onClick={() => { setIsSelectionMode(true); setShowPrintModal(false); }}
                className="w-full flex items-center gap-6 p-6 rounded-[32px] border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group text-left"
              >
                <div className="bg-white w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <MousePointer2 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-800">เลือกพิมพ์บางรายการ</p>
                  <p className="text-sm font-bold text-slate-400">กลับไปยังหน้าตารางเพื่อติ๊กเลือกรายการที่ต้องการ</p>
                </div>
              </button>
            </div>
            
            <div className="px-10 pb-10">
              <button onClick={() => setShowPrintModal(false)} className="w-full py-4 text-slate-400 font-black hover:text-slate-600 transition-all">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

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
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบรายการสั่งซื้อของคุณ ${deleteTarget?.recipientName}? ข้อมูลนี้จะไม่สามารถกู้คืนได้`}
      />
    </div>
  );
};

export default App;
