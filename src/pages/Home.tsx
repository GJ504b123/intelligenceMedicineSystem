



import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Bell, Search, PlusCircle, FileText, Brain, BarChart2, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { AuthContext } from '@/contexts/authContext';
import { useContext } from 'react';
import { useTheme } from '@/hooks/useTheme';

// 类型定义
interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  lastVisit: string;
  diagnosis: string;
}

// 偏差诊断类型定义
interface DiagnosisDiscrepancy {
  id: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  visitDate: string;
  aiDiagnosis: string;
  doctorDiagnosis: string;
  discrepancyLevel: 'high' | 'medium' | 'low';
  discrepancyDetails: string;
}

// Mock 数据
const recentPatients: Patient[] = [
  {
    id: '1',
    name: '李明',
    gender: '男',
    age: 32,
    lastVisit: '2025-01-10',
    diagnosis: '牙周炎'
  },
  {
    id: '2',
    name: '王芳',
    gender: '女',
    age: 45,
    lastVisit: '2025-01-12',
    diagnosis: '龋齿'
  },
  {
    id: '3',
    name: '张伟',
    gender: '男',
    age: 28,
    lastVisit: '2025-01-13',
    diagnosis: '牙髓炎'
  },
  {
    id: '4',
    name: '刘娜',
    gender: '女',
    age: 52,
    lastVisit: '2025-01-14',
    diagnosis: '智齿冠周炎'
  }
];

// 需要重新诊断的病例数据
const diagnosisDiscrepancies: DiagnosisDiscrepancy[] = [
  {
    id: '1',
    patientId: '5',
    patientName: '赵强',
    gender: '男',
    age: 36,
    visitDate: '2025-01-15',
    aiDiagnosis: '根尖周炎 (可能性85%)',
    doctorDiagnosis: '牙髓炎 (轻度)',
    discrepancyLevel: 'high',
    discrepancyDetails: 'AI检测到明显的根尖周炎症和骨吸收迹象，与医生诊断的轻度牙髓炎存在显著差异。'
  },
  {
    id: '2',
    patientId: '6',
    patientName: '陈琳',
    gender: '女',
    age: 29,
    visitDate: '2025-01-14',
    aiDiagnosis: '牙周炎 (中度)',
    doctorDiagnosis: '牙龈炎',
    discrepancyLevel: 'high',
    discrepancyDetails: 'AI分析显示牙槽骨吸收和牙周袋深度超过3mm，建议重新评估是否为牙周炎。'
  }
];

// 导航链接
const navLinks = [
  { name: '工作台', path: '/' },
  { name: '患者管理', path: '/patients' },
  { name: '病历管理', path: '/records' },
  { name: '存证中心', path: '/evidence' }
];

// 数据卡片
const StatCard = ({ title, value, onClick }: { title: string; value: number; onClick: () => void }) => (
  <div 
    className="w-[360px] h-[160px] bg-white border border-gray-200 rounded-[12px] p-6 cursor-pointer transition-shadow hover:shadow-lg flex flex-col justify-between"
    onClick={onClick}
  >
    <h3 className="text-gray-600 font-medium">{title}</h3>
    <div className="flex items-baseline justify-between">
      <span className="text-[48px] font-bold text-gray-900">{value}</span>
      <button className="text-blue-600 flex items-center gap-1">
        查看详情 <span className="text-sm">→</span>
      </button>
    </div>
  </div>
);

// 快速操作按钮
const ActionButton = ({ title, icon, isPrimary = false, onClick }: { title: string; icon: React.ReactNode; isPrimary?: boolean; onClick: () => void }) => (
  <button
    className={`w-[160px] h-[48px] rounded-[8px] flex items-center justify-center gap-2 font-medium transition-colors
      ${isPrimary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
    onClick={onClick}
  >
    {icon}
    {title}
  </button>
);

// 患者卡片
const PatientCard = ({ patient }: { patient: Patient }) => {
  const navigate = useNavigate();
  
  const handleViewRecord = () => {
    navigate(`/records/${patient.id}`);
  };
  
  const handleCreateRecord = () => {
    navigate(`/records/create?patientId=${patient.id}`);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center h-[80px] mb-3">
      <div className="flex items-center gap-4">
        <User className="text-gray-500" size={24} />
        <div>
          <div className="flex items-center gap-4 text-gray-800">
            <span className="font-medium">{patient.name}</span>
            <span>{patient.gender} {patient.age}岁</span>
            <span className="text-gray-500 text-sm">上次就诊: {patient.lastVisit}</span>
          </div>
          <div className="text-gray-600 text-sm mt-1">诊断: {patient.diagnosis}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          onClick={handleViewRecord}
        >
          查看病历
        </button>
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleCreateRecord}
        >
          新建记录
        </button>
      </div>
    </div>
  );
}

// 诊断偏差卡片
const DiagnosisDiscrepancyCard = ({ discrepancy }: { discrepancy: DiagnosisDiscrepancy }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/records/${discrepancy.patientId}`);
    toast(`查看${discrepancy.patientName}的详细病历和AI分析报告`);
  };
  
  const handleReDiagnose = () => {
    navigate(`/records/create?patientId=${discrepancy.patientId}&reDiagnose=true`);
    toast(`开始重新诊断${discrepancy.patientName}`);
  };
  
  const getDiscrepancyLevelText = () => {
    switch(discrepancy.discrepancyLevel) {
      case 'high':
        return '显著差异';
      case 'medium':
        return '中度差异';
      case 'low':
        return '轻微差异';
      default:
        return '差异';
    }
  };
  
  return (
    <div className="bg-white border border-orange-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {discrepancy.patientName}
              <span className="text-gray-500">{discrepancy.gender} {discrepancy.age}岁</span>
            </div>
            <div className="text-sm text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {getDiscrepancyLevelText()}
            </div>
            <div className="text-gray-500 text-sm ml-auto">就诊日期: {discrepancy.visitDate}</div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-sm text-blue-700 font-medium mb-1">AI诊断</div>
            <div className="text-gray-900">{discrepancy.aiDiagnosis}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-sm text-purple-700 font-medium mb-1">医生诊断</div>
            <div className="text-gray-900">{discrepancy.doctorDiagnosis}</div>
          </div>
        </div>
        <div className="text-gray-700 text-sm">
          <span className="font-medium">偏差分析:</span> {discrepancy.discrepancyDetails}
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button 
          onClick={handleViewDetails}
          className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
        >
          <Eye size={14} />
          查看详情
        </button>
        <button 
          onClick={handleReDiagnose}
          className="px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm flex items-center gap-1"
        >
          <RefreshCw size={14} />
          重新诊断
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState('');
  
  // 获取当前日期并格式化
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    
    setCurrentDate(`${year}年${month}月${day}日 星期${weekday}`);
  }, []);
  
  // 处理导航点击
  const handleNavClick = (path: string) => {
    navigate(path);
    toast(`导航到${path === '/' ? '工作台' : path.substring(1)}`);
  };
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast('搜索功能即将上线');
  };
  
  // 处理通知点击
  const handleNotificationClick = () => {
    toast('您有新的通知');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-[64px] bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between">
          {/* 左侧 Logo */}
          {/* <div className="text-2xl font-bold text-blue-600">医疗管理系统</div> */}
          <div className="text-2xl font-bold text-blue-600 flex gap-5 items-center"><img src="src/picture/nav.png" style={{width:'100px'}} alt="yidianjiutong"  />医点就通</div>
          
          {/* 中间导航菜单 */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  link.path === '/' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>
          
          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                placeholder="搜索..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </form>
            
            <button 
              onClick={handleNotificationClick} 
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="text-gray-700" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button
              onClick={logout}
              className="px-3 py-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50 transition-colors text-sm hidden md:block"
            >
              退出登录
            </button>
            
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
              张
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <main className="flex-grow pt-[64px] px-[40px] py-[32px] max-w-[1440px] mx-auto w-full">
        {/* 欢迎信息 */}
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-gray-900">欢迎回来，张医生</h1>
          <p className="text-gray-600 text-[16px] mt-1">今天是 {currentDate}</p>
        </div>
        
         {/* 数据卡片区域 */}
        <div className="flex flex-wrap gap-[24px] mb-10">
          <StatCard title="今日待处理" value={12} onClick={() => toast('查看今日待处理任务')} />
          <StatCard title="本月新增患者" value={28} onClick={() => toast('查看本月新增患者')} />
          <StatCard 
            title="待审核病历" 
            value={5} 
            onClick={() => toast('查看待审核病历')} 
          />
          {diagnosisDiscrepancies.length > 0 && (
            <StatCard 
              title="需要重新诊断" 
              value={diagnosisDiscrepancies.length} 
              onClick={() => {
                // 滚动到需要重新诊断的区域
                const element = document.querySelector('.bg-orange-50');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
            />
          )}
        </div>
        
        {/* 快速操作区域 */}
        <div className="mb-10">
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">快速操作</h2>
          <div className="flex flex-wrap gap-4">
            <ActionButton 
              title="新建病历" 
              icon={<PlusCircle size={18} />} 
              isPrimary={true} 
              onClick={() => navigate('/records/create')} 
            />
            <ActionButton 
              title="查看预约" 
              icon={<FileText size={18} />} 
              onClick={() => toast('查看预约')} 
            />
            <ActionButton 
              title="AI分析" 
              icon={<Brain size={18} />} 
              onClick={() => toast('AI分析功能即将上线')} 
            />
            <ActionButton 
              title="统计报表" 
              icon={<BarChart2 size={18} />} 
              onClick={() => toast('查看统计报表')} 
            />
          </div>
        </div>
        
         {/* 需要重新诊断的病例 */}
        {diagnosisDiscrepancies.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-orange-600" />
              <h2 className="text-[18px] font-bold text-gray-900">需要重新诊断的病例 ({diagnosisDiscrepancies.length})</h2>
              <div className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                高优先级
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              {diagnosisDiscrepancies.map((discrepancy) => (
                <DiagnosisDiscrepancyCard key={discrepancy.id} discrepancy={discrepancy} />
              ))}
            </div>
          </div>
        )}
        
        {/* 最近访问的患者列表 */}
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">最近访问的患者</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {recentPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}