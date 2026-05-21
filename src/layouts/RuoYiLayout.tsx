import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation,Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, ShieldCheck, 
  History as HistoryIcon, BarChart3, 
  MessageSquare, ClipboardList, Menu, Bell, 
  LogOut, ChevronRight, Home, Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import navLogo from '@/public/nav.png';

// --- 1. HIS 模块导航 ---
// const HIS_MODULES = [
//   { label: '门诊挂号', id: 'reg' },
//   { label: '分诊叫号', id: 'triage' },
//   { label: '医生工作站', id: 'doctor', active: true },
//   { label: '收费管理', id: 'billing' },
//   { label: '药房管理', id: 'pharmacy' },
// ];

// --- 2. 角色配置 (🎨 颜色修复版) ---
const ROLE_CONFIG = {
  doctor: {
    // 🔵 医生：经典医疗蓝 - 此时此刻，专业至上
    logoText: '医点就通', 
    subLogoText: '智能诊疗决策系统', 
    // 侧边栏头像背景色
    themeColor: 'bg-[#001529]', 
    // 菜单选中时的背景 (高亮蓝)
    activeBg: 'bg-blue-600 shadow-blue-900/50', 
    headerTitle: '门诊医生工作站',
    statusPrefix: 'AI 引擎: 在线', 
    userLabel: '张医生',
    menu: [
      { icon: LayoutDashboard, label: '智能诊疗台', path: '/' },
      { icon: Users, label: '患者全息档案', path: '/management' },
      { icon: FileText, label: '病历存证库', path: '/records' },
      { icon: ShieldCheck, label: '合规监管', path: '/center' },
    ]
  },
  patient: {
    // 🟢 患者：治愈生命绿 - 轻松、健康、无压力
    logoText: '医点就通',
    subLogoText: '个人健康信托',
    // 侧边栏头像背景色
    themeColor: 'bg-emerald-900',
    // 菜单选中时的背景 (鲜艳绿)
    activeBg: 'bg-emerald-500 shadow-emerald-900/50',
    headerTitle: '我的健康空间',
    statusPrefix: '隐私保护中',
    userLabel: '李明',
    menu: [
      { icon: LayoutDashboard, label: '健康概览', path: '/patient' },
      { icon: MessageSquare, label: 'AI 导诊', path: '/patient/ai-chat' },
      { icon: ClipboardList, label: '我的病历', path: '/patient/records' },
    ]
  },
  'third-party': {
    // 🟣 管理端：监管皇室紫 - 权威、公正、高阶 (不再是黑色！)
    logoText: '医点就通', 
    subLogoText: '全院数据监管驾驶舱', 
    // 侧边栏头像背景色
    themeColor: 'bg-violet-900', 
    // 菜单选中时的背景 (亮紫色，非常显眼)
    activeBg: 'bg-violet-600 shadow-violet-900/50',
    headerTitle: '医疗质量与存证管理平台', 
    statusPrefix: '司法链节点：正常', 
    userLabel: '病案室主任', 
    menu: [
      { icon: ShieldCheck, label: '全院存证概览', path: '/verify' }, 
      { icon: FileText, label: '病案归档审计', path: '/verify/files' }, 
      { icon: HistoryIcon, label: '区块链溯源日志', path: '/verify/records' }, 
      { icon: BarChart3, label: '质控数据报表', path: '/verify/center' }, 
    ]
  }
};

export default function RuoYiLayout() {
  //useNavigate，用于导航到指定路由
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  const config = ROLE_CONFIG[role || 'doctor'];

  useEffect(() => {
    const date = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    //getMonth()从0开始，所以要加1月
    //为什么getDay的0对应周天
    setCurrentDate(`${date.getMonth() + 1}月${date.getDate()}日 星期${weekdays[date.getDay()]}`);
  }, []);

  // const handleModuleClick = (mod: typeof HIS_MODULES[0]) => {
  //   if (!mod.active) {
  //     toast.info(`正在跳转至 [${mod.label}] ...`, {
  //       description: '演示环境仅开放“医生工作站”核心模块'
  //     });
  //   }
  // };

  return (
    <div className="flex h-screen w-full bg-[#f0f2f5] overflow-hidden font-sans">
      {/* --- 左侧侧边栏 --- */}
      <aside 
        className={cn(
          "text-white flex flex-col shadow-2xl z-30 transition-all duration-300 ease-in-out relative overflow-hidden",
          collapsed ? "w-[70px]" : "w-[240px]",
          config.themeColor

          // "bg-[#001529]" // 侧边栏保持深蓝底色，这是 B 端系统的基调
        )}
      >
        {/* 背景装饰：稍微加点噪点纹理，显得有质感 */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25 pointer-events-none "></div>
        
        {/* 动态光晕：根据角色颜色变化，让侧边栏不那么死板 */}
        <div className={cn("absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-80", config.themeColor)}></div>

        {/* Logo 区域 */}
        <div className={cn(
          "h-[64px] flex items-center transition-all duration-300 border-b border-white/10 relative z-10",
          collapsed ? "justify-center px-0" : "px-5"
        )}>
          <div className={cn(
            "flex-shrink-0 w-16 h-8 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/10",
          )}>
            
            <img src={navLogo} alt="医点就通logo" />
          </div>
          
          {!collapsed && (
            <div className="ml-3 flex flex-col justify-center animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="font-bold text-lg tracking-wide text-white leading-none mb-1">
                {config.logoText}
              </span>
              <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">
                {config.subLogoText}
              </span>
            </div>
          )}
        </div>

        {/* 菜单区域 */}
        <nav className="flex-1 py-6 space-y-1.5 px-3 overflow-y-auto relative z-10 custom-scrollbar">
          {config.menu.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center cursor-pointer transition-all rounded-lg h-[44px] group relative",
                  isActive 
                    ? `${config.activeBg} text-white shadow-md font-medium` 
                    //
                    : "text-slate-400 hover:text-white hover:bg-white/10",
                  collapsed ? "justify-center px-0" : "px-3"
                )}
                title={collapsed ? item.label : ''}
              >
                <item.icon size={18} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                {!collapsed && <span className="ml-3 text-sm">{item.label}</span>}
              </div>
            );
          })}
        </nav>
        
        {/* 底部折叠按钮 */}
        <div 
          onClick={() => setCollapsed(!collapsed)}
          className="h-[48px] border-t border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative z-10"
        >
          {collapsed ? <ChevronRight size={18} /> : <div className="flex items-center gap-2 text-xs opacity-70"><Menu size={14}/> 收起导航</div>}
        </div>
      </aside>

      {/* --- 右侧主区域 --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[64px] bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm z-20 relative">
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 flex items-center gap-1">
              <Home size={14} /> 首页
            </span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-bold text-slate-800">{config.headerTitle}</span>
          </div>

          {/* HIS 伪装导航 (医生端特供) */}
          {role === 'doctor' && (
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden 2xl:flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              {/* {HIS_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => handleModuleClick(mod)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                    mod.active
                      ? "bg-white text-blue-700 shadow-sm font-bold ring-1 ring-black/5"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  {mod.label}
                </button>
              ))} */}
            </div>
          )}

          <div className="flex items-center gap-5">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Zap size={12} className="text-yellow-500 fill-yellow-500" /> 
                {config.statusPrefix}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{currentDate}</p>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">{config.userLabel}</p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1 uppercase">ID: 89002</p>
                </div>
                {/* 头像颜色跟随角色 */}
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white", config.themeColor)}>
                  {config.userLabel.charAt(0)}
                </div>
              </div>
              
              <button 
                onClick={logout} 
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="退出登录"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#F8FAFC] p-6 relative">
          {/* {children} */}
          {/* 渲染子组件，根据路由匹配渲染对应的组件 */}
          {/* //显示子路由内容 ：在父路由组件中创建一个"占位符"，当匹配到子路由时，子路由的组件会渲染到这个位置 */}
          <Outlet/>
        </main>
      </div>
    </div>
  );
}