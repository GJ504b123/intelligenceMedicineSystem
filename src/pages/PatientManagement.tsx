import { useState, useMemo } from 'react';
import RuoYiLayout from '@/layouts/RuoYiLayout';
import { Search, Plus, User, Phone, MapPin, AlertCircle, Calendar, X, Save, Filter } from 'lucide-react';
import { toast } from 'sonner';

// 1. 定义数据类型
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: '男' | '女';
  risk: 'high' | 'medium' | 'normal';
  diagnosis: string;
  lastVisit: string;
  phone: string;
  tags: string[]; // 新增标签字段
}

// 2. 初始模拟数据 (稍微丰富一点)
const INITIAL_DATA: Patient[] = [
  { id: 'P001', name: '李明', age: 6, gender: '男', risk: 'high', diagnosis: '腺样体肥大', lastVisit: '2026-02-09', phone: '138****1234', tags: ['今日预约'] },
  { id: 'P002', name: '王芳', age: 28, gender: '女', risk: 'normal', diagnosis: '慢性牙周炎', lastVisit: '2026-02-07', phone: '139****5678', tags: ['待复诊'] },
  { id: 'P003', name: '赵强', age: 45, gender: '男', risk: 'medium', diagnosis: '种植牙修复', lastVisit: '2026-02-05', phone: '137****9012', tags: [] },
  { id: 'P004', name: '孙小美', age: 12, gender: '女', risk: 'normal', diagnosis: '错颌畸形', lastVisit: '2026-02-01', phone: '136****3456', tags: ['今日预约'] },
  { id: 'P005', name: '周杰', age: 33, gender: '男', risk: 'normal', diagnosis: '龋齿充填', lastVisit: '2026-01-28', phone: '135****7890', tags: [] },
  { id: 'P006', name: '吴丽', age: 55, gender: '女', risk: 'high', diagnosis: '牙列缺失', lastVisit: '2026-01-20', phone: '133****2345', tags: ['待复诊'] },
];

export default function PatientManagement() {
  // --- 状态管理 ---
  const [patients, setPatients] = useState<Patient[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('全部');
  const [showModal, setShowModal] = useState(false); // 控制新增弹窗

  // --- 核心交互逻辑：过滤数据 ---
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // 1. 搜索匹配 (姓名/电话/ID)
      const matchSearch = p.name.includes(searchQuery) || p.phone.includes(searchQuery) || p.id.includes(searchQuery);
      
      // 2. 标签/风险匹配
      let matchFilter = true;
      if (activeFilter === '高风险') matchFilter = p.risk === 'high';
      else if (activeFilter === '待复诊') matchFilter = p.tags.includes('待复诊');
      else if (activeFilter === '今日预约') matchFilter = p.tags.includes('今日预约');
      
      return matchSearch && matchFilter;
    });
  }, [patients, searchQuery, activeFilter]);

  // --- 模拟新增患者 ---
  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: `P00${patients.length + 1}`,
      name: '新增患者', // 演示简化，实际应该取表单值
      age: 30,
      gender: '男',
      risk: 'normal',
      diagnosis: '待初诊',
      lastVisit: '2026-02-09',
      phone: '139****0000',
      tags: ['今日预约']
    };
    
    // 模拟网络请求延迟
    toast.loading('正在创建档案...');
    setTimeout(() => {
      setPatients(prev => [newPatient, ...prev]); // 加到最前面
      setShowModal(false);
      toast.dismiss();
      toast.success('建档成功！已自动发送短信通知患者');
    }, 1000);
  };

  return (
    <RuoYiLayout>
      {/* 顶部统计区 (动态计算) */}
      <div className="mb-6 flex justify-between items-center animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">患者管理 CRM</h1>
          <p className="text-gray-500 text-sm mt-1 flex gap-4">
            <span>全院在册: {patients.length} 人</span>
            <span className="text-blue-600 font-bold">本页展示: {filteredPatients.length} 人</span>
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> 新增建档
        </button>
      </div>

      {/* 搜索栏 & 过滤器 */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex gap-4 shadow-sm sticky top-0 z-10">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入姓名、手机号或身份证号搜索..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-100 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['全部', '高风险', '待复诊', '今日预约'].map(tag => (
            <button 
              key={tag} 
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeFilter === tag 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 卡片墙 Grid Layout */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((p, index) => (
            <div 
              key={p.id} 
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group relative overflow-hidden animate-in fade-in zoom-in duration-300"
              style={{ animationDelay: `${index * 50}ms` }} // 瀑布流动画效果
            >
              {/* 风险/状态标签 */}
              {p.risk === 'high' && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold shadow-sm">
                  高风险
                </div>
              )}
              {p.tags.includes('待复诊') && p.risk !== 'high' && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold shadow-sm">
                  待复诊
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-inner ${
                  p.gender === '男' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                }`}>
                  {p.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    {p.name}
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">{p.age}岁</span>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{p.id}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-400"><AlertCircle size={14} /> 诊断</span>
                  <span className="font-bold text-gray-700">{p.diagnosis}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-400"><Calendar size={14} /> 末次</span>
                  <span className="font-mono text-xs">{p.lastVisit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-400"><Phone size={14} /> 电话</span>
                  <span className="font-mono text-xs tracking-wider">{p.phone}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => toast(`正在生成 ${p.name} 的 360° 健康画像...`)}
                  className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1"
                >
                  <User size={14} /> 查看画像
                </button>
                <button 
                  onClick={() => toast.success(`随访任务已发送至 ${p.name} 手机`)}
                  className="bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-black transition-all shadow-sm active:scale-95"
                >
                  发起随访
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 空状态 (Empty State)
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Filter size={32} className="opacity-20" />
          </div>
          <p>没有找到符合条件的患者</p>
          <button onClick={() => {setSearchQuery(''); setActiveFilter('全部')}} className="mt-4 text-blue-600 hover:underline text-sm">
            清除筛选条件
          </button>
        </div>
      )}

      {/* 新增患者弹窗 (Modal) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">新建患者档案</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">姓名</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="输入真实姓名" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">年龄</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="25" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">性别</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                    <option>男</option>
                    <option>女</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">联系电话</label>
                <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="139..." />
              </div>
              
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                <Save size={18} /> 确认建档
              </button>
            </form>
          </div>
        </div>
      )}
    </RuoYiLayout>
  );
}