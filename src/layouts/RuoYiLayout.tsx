import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, ShieldCheck, 
  History as HistoryIcon, BarChart3, Heart, 
  MessageSquare, ClipboardList, Menu, Bell, 
  ChevronRight, User, Clock, LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/contexts/authContext'; //

// 1. 扩充后的 ROLE_CONFIG 配置表
const ROLE_CONFIG = {
  doctor: {
    logoText: '医点就通',
    themeColor: 'bg-[#1E40AF]', // 医生蓝
    activeBg: 'bg-[#1E40AF]',
    headerTitle: '下午好，张医生',
    statusPrefix: '数字化门诊运行正常',
    userLabel: '张医生',
    menu: [
      { icon: LayoutDashboard, label: '工作台', path: '/' },
      { icon: Users, label: '患者管理', path: '/patient' },
      { icon: FileText, label: '病历管理', path: '/records/create' },
      { icon: ShieldCheck, label: '存证中心', path: '/verify' },
    ]
  },
  patient: {
    logoText: '医点就通',
    themeColor: 'bg-[#059669]', // 患者绿
    activeBg: 'bg-[#059669]',
    headerTitle: '晚上好，李明',
    statusPrefix: '您的健康档案状态：优秀',
    userLabel: '李明',
    menu: [
      { icon: LayoutDashboard, label: '健康概览', path: '/patient' },
      { icon: MessageSquare, label: 'AI 导诊', path: '/patient/ai-chat' },
      { icon: ClipboardList, label: '我的病历', path: '/patient/records' },
    ]
  },
  'third-party': {
    logoText: '医点就通',
    themeColor: 'bg-[#1E293B]', // 权威灰
    activeBg: 'bg-[#334155]',
    headerTitle: '验证控制台',
    statusPrefix: '区块链节点同步状态：正常',
    userLabel: '管理员：Admin_01',
    menu: [
      { icon: ShieldCheck, label: '验证概览', path: '/verify' },
      { icon: FileText, label: '文件校验', path: '/verify/files' },
      { icon: HistoryIcon, label: '验证记录', path: '/verify/records' },
      { icon: BarChart3, label: '统计分析', path: '/verify/statistics' },
    ]
  }
};

export default function RuoYiLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useContext(AuthContext); //
  const [collapsed, setCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  // 匹配角色配置，默认为医生端
  const config = ROLE_CONFIG[role || 'doctor'];

  // 2. 收口 currentDate 逻辑，全局统一管理
  useEffect(() => {
    const date = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    setCurrentDate(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${weekdays[date.getDay()]}`);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5]">
      {/* --- 左侧侧边栏 --- */}
      <aside 
        className={cn(
          "text-white flex flex-col shadow-xl z-20 transition-all duration-300 bg-[#001529]",
          collapsed ? "w-16" : "w-[240px]"
        )}
      >
<div className={cn(
  "h-16 flex items-center transition-all duration-300 border-b border-white/10",
  collapsed ? "justify-center" : "px-4 gap-3", // 折叠时居中，展开时靠左带间距
  config.themeColor
)}>
  {/* 1. 图片容器：控制大小和形状 */}
  <div className="flex-shrink-0 w-18 h-8 bg-white/20 rounded-lg p-1 flex items-center justify-center shadow-inner overflow-hidden">
    <img 
      src="/src/picture/nav.png" 
      alt="logo" 
      className="w-full h-full object-contain filter brightness-110" 
    />
  </div>

  {/* 2. 文字区域：处理折叠后的隐藏和动画 */}
  {!collapsed && (
    <div className="font-bold text-base tracking-tight truncate animate-in fade-in slide-in-from-left-2 duration-300">
      {config.logoText}
    </div>
  )}
</div>

        <nav className="flex-1 py-4">
          {config.menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center px-4 py-3 cursor-pointer transition-all mx-2 rounded-md mb-1",
                  isActive 
                    ? `${config.activeBg} text-white shadow-md font-bold` 
                    : "text-gray-400 hover:text-white hover:bg-[#ffffff1a]"
                )}
              >
                <item.icon size={18} />
                {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* --- 右侧主区域 --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 动态驱动的顶栏 */}
        <header className="h-[100px] bg-white border-b border-gray-100 flex justify-between items-center px-10 shadow-sm z-10">
          <div>
            <div className="flex items-center gap-4">
              <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-blue-500">
                <Menu size={20} />
              </button>
              <h1 className="text-3xl font-bold text-[#1E293B]">{config.headerTitle}</h1>
            </div>
            <p className="text-gray-500 mt-2 ml-9 flex items-center gap-2 text-sm font-medium">
              <Clock size={14} className="text-gray-400" />
              <span className={role === 'patient' ? 'text-green-600' : 'text-blue-600'}>
                {config.statusPrefix}
              </span>
              <span className="text-gray-300">|</span>
              <span>{currentDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{config.userLabel}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{role}</p>
              </div>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold", config.themeColor)}>
                {config.userLabel.charAt(0)}
              </div>
              <button 
                onClick={logout} 
                className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="退出登录"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* 具体的页面业务内容 */}
        <main className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}