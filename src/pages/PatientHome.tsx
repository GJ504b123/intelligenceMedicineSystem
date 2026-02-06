import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  User, Bell, Search, Brain, FileText, Shield, 
  Calendar as CalendarIcon, Clock, RefreshCw, 
  LayoutDashboard, Activity, MessageSquare 
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 模拟通知数据
const notificationItems = [
  {
    id: '1',
    type: 'authorization',
    icon: <Bell className="text-orange-500" size={18} />,
    title: '您有1条新的授权请求待处理',
    details: '请求查看: 2024年度口腔检查报告',
    doctorName: '王医生',
    hospital: 'XX口腔医院'
  },
  {
    id: '2',
    type: 'report',
    icon: <FileText className="text-blue-500" size={18} />,
    title: '您有1份新的诊断报告可查看',
    details: '来自: 张医生 (XX口腔医院)',
    time: '2025-01-10'
  }
];

export default function PatientHome() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useContext(AuthContext);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好');
    
    const date = new Date();
    setCurrentDate(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 侧边导航栏 - 患者端绿色主题 */}
      <aside className="w-[240px] bg-[#059669] text-white flex flex-col fixed h-full shadow-xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg">
            <img src="/src/picture/nav.png" className="w-18 h-8" alt="Logo" />
          </div>
          <span className="text-xl font-bold tracking-tight">医点就通</span>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {[
            { name: '健康概览', icon: LayoutDashboard, path: '/patient', active: true },
            { name: '我的病历', icon: FileText, path: '/patient/records' },
            { name: 'AI 智能自查', icon: Brain, path: '/patient/ai-chat' },
            { name: '授权管理', icon: Shield, path: '#' },
            { name: '个人中心', icon: User, path: '/patient/profile' },
          ].map((item) => (
            <div 
              key={item.name} 
              onClick={() => item.path !== '#' && navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                item.active ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={item.active ? 'text-white' : 'text-white/80'} />
              <span className={item.active ? 'font-bold' : 'text-white/90'}>{item.name}</span>
            </div>
          ))}
        </nav>
        
        <div className="p-6 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <RefreshCw size={18} /> 退出登录
          </button>
        </div>
      </aside>

      {/* 主体内容 */}
      <main className="flex-1 ml-[240px] p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">{greeting}，李明</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <Clock size={16} /> 您的健康档案状态：<span className="text-green-600 font-bold">优秀</span> · {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 shadow-sm">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200">
              李
            </div>
          </div>
        </header>

        {/* 欢迎卡片 */}
        <div className="bg-gradient-to-r from-[#059669] to-[#10B981] rounded-2xl p-8 text-white shadow-lg mb-10 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">数字化医疗助手为您服务</h2>
            <p className="opacity-90 max-w-xl">您有 2 份新的检查报告已生成数字存证，医生建议您近期关注牙周健康。</p>
            <button className="mt-6 px-6 py-2 bg-white text-green-700 rounded-full font-bold hover:bg-green-50 transition-colors">
              查看最新报告
            </button>
          </div>
          <Activity className="absolute right-10 top-1/2 -translate-y-1/2 text-white opacity-10" size={180} />
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { name: 'AI 智能自查', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', action: () => navigate('/patient/ai-chat') },
            { name: '我的电子病历', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', action: () => navigate('/patient/records') },
            { name: '授权管理', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', action: () => toast('功能开发中') },
            { name: '在线问诊', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', action: () => toast('功能开发中') },
          ].map((item) => (
            <div 
              key={item.name} 
              onClick={item.action}
              className={`h-[140px] rounded-2xl border ${item.border} ${item.bg} flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all hover:-translate-y-1`}
            >
              <div className={`p-3 rounded-full bg-white shadow-sm mb-3 ${item.color}`}>
                <item.icon size={28} />
              </div>
              <span className="font-bold text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>

        {/* 通知中心 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Bell className="text-gray-400" size={20} /> 消息通知
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {notificationItems.map((item, index) => (
              <div key={item.id} className={`p-6 flex items-start gap-4 ${index !== notificationItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.details}</p>
                  {item.time && <p className="text-xs text-gray-400 mt-2">{item.time}</p>}
                </div>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-600">
                  查看详情
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}