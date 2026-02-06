import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  User, Bell, Search, PlusCircle, FileText, Brain, 
  BarChart2, AlertTriangle, RefreshCw, Eye, ArrowRight,
  LayoutDashboard, Users, ShieldCheck, TrendingUp, Clock // 已补充导入 Clock
} from 'lucide-react';
import { AuthContext } from '@/contexts/authContext';
import { useContext } from 'react';

// 诊断偏差类型定义
interface DiagnosisDiscrepancy {
  id: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  visitDate: string;
  aiDiagnosis: string;
  doctorDiagnosis: string;
  discrepancyLevel: 'high' | 'medium';
  details: string;
}

const discrepancies: DiagnosisDiscrepancy[] = [
  {
    id: '1',
    patientId: 'P005',
    patientName: '赵强',
    gender: '男',
    age: 36,
    visitDate: '2025-01-15',
    aiDiagnosis: '根尖周炎 (置信度 92%)',
    doctorDiagnosis: '中龋 (待复查)',
    discrepancyLevel: 'high',
    details: 'AI检测到根尖周透射影明显，伴随骨吸收迹象，建议重新评估炎症程度。'
  },
  {
    id: '2',
    patientId: 'P006',
    patientName: '陈琳',
    gender: '女',
    age: 29,
    visitDate: '2025-01-14',
    aiDiagnosis: '牙周炎 (二级)',
    doctorDiagnosis: '牙龈炎',
    discrepancyLevel: 'medium',
    details: '影像显示牙槽骨水平吸收超过根长1/3，符合牙周炎诊断标准。'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    setCurrentDate(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${['日','一','二','三','四','五','六'][date.getDay()]}`);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 侧边导航栏 - 保持全局统一 */}
      <aside className="w-[240px] bg-[#1E40AF] text-white flex flex-col fixed h-full shadow-xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg">
            <img src="/src/picture/nav.png" className="w-18 h-8" alt="Logo" />
          </div>
          <span className="text-xl font-bold tracking-tight">医点就通</span>
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {[
            { name: '工作面板', icon: LayoutDashboard, active: true },
            { name: '患者管理', icon: Users },
            { name: '病历库', icon: FileText },
            { name: '存证中心', icon: ShieldCheck },
            { name: '数据分析', icon: TrendingUp },
          ].map((item) => (
            <div key={item.name} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${item.active ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'}`}>
              <item.icon size={20} className={item.active ? 'text-white' : 'text-white/60'} />
              <span className={item.active ? 'font-bold' : 'text-white/80'}>{item.name}</span>
            </div>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-2 text-white/60 hover:text-red-300 transition-colors">
            <RefreshCw size={18} /> 退出工作台
          </button>
        </div>
      </aside>

      {/* 主体内容 */}
      <main className="flex-1 ml-[240px] p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">下午好，张医生</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <Clock size={16} /> 数字化门诊运行正常 · {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input placeholder="搜索患者/病历号..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full w-[300px] outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <button className="relative p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>

        {/* 统计概览 */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { label: '今日接诊', value: '12', sub: '环比上升 8%', color: 'text-blue-600' },
            { label: '本月病历', value: '148', sub: '数据已上链存证', color: 'text-green-600' },
            { label: '待审核', value: '05', sub: '需要尽快处理', color: 'text-orange-600' },
            { label: '偏差预警', value: discrepancies.length, sub: '高优先级纠偏', color: 'text-red-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <div className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-gray-400 mt-2">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* 核心预警区域 */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-[#F59E0B]">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold text-gray-800">AI 诊断偏差高风险预警 ({discrepancies.length})</h2>
            </div>
            <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
              查看全部预警 <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {discrepancies.map((item) => (
              <div key={item.id} className="bg-white border-l-4 border-orange-500 rounded-r-xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-50 p-3 rounded-full text-orange-600">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{item.patientName} <span className="text-gray-400 font-normal text-sm">/ {item.gender} {item.age}岁</span></h3>
                      <p className="text-xs text-gray-400">门诊号: {item.patientId} · 检查时间: {item.visitDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 flex items-center gap-2">
                      <Eye size={16} /> 查看影像
                    </button>
                    <button 
                      onClick={() => navigate(`/records/create?patientId=${item.patientId}&reDiagnose=true`)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
                    >
                      <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> 重新诊断
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-4 bg-gray-50 p-4 rounded-xl items-center">
                  <div className="col-span-3">
                    <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">医生原始诊断</p>
                    <p className="text-sm font-medium text-gray-700">{item.doctorDiagnosis}</p>
                  </div>
                  <div className="col-span-1 flex flex-col items-center">
                    <div className="h-8 w-px bg-gray-200"></div>
                    <Brain className="text-blue-500 my-1" size={20} />
                    <div className="h-8 w-px bg-gray-200"></div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">AI 辅助分析建议</p>
                    <p className="text-sm font-bold text-blue-700">{item.aiDiagnosis}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-800">偏差分析：</span>{item.details}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 快速操作 */}
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/records/create')}
            className="flex-1 h-[120px] bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 group"
          >
            <PlusCircle size={32} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg">新建数字化病历</span>
          </button>
          <button className="flex-1 h-[120px] bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all group shadow-sm">
            <Users size={32} className="mb-2 text-gray-400 group-hover:text-blue-500" />
            <span className="font-bold text-lg">预约挂号管理</span>
          </button>
          <button className="flex-1 h-[120px] bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all group shadow-sm">
            <BarChart2 size={32} className="mb-2 text-gray-400 group-hover:text-blue-500" />
            <span className="font-bold text-lg">月度门诊报表</span>
          </button>
        </div>
      </main>
    </div>
  );
}