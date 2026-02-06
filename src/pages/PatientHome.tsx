import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Bell, Search, Brain, FileText, Shield, Search as SearchIcon, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 类型定义
interface NotificationItem {
  id: string;
  type: 'authorization' | 'report';
  icon: React.ReactNode;
  title: string;
  details: string;
  time?: string;
  doctorName?: string;
  hospital?: string;
}

// 模拟通知数据
const notificationItems: NotificationItem[] = [
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

// 生成日历数据
const generateCalendarDays = (year: number, month: number, highlightDate: number) => {
  const days = [];
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // 添加空白格子以对齐星期
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // 添加月份天数
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
};

export default function PatientHome() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useContext(AuthContext);
  const [greeting, setGreeting] = useState('');
  const [calendarDays, setCalendarDays] = useState<(number | null)[]>([]);
  
  // 设置问候语和日历数据
  useEffect(() => {
    // 设置问候语
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('早上好');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('下午好');
    } else {
      setGreeting('晚上好');
    }
    
    // 生成日历数据（2025年1月）
    setCalendarDays(generateCalendarDays(2025, 1, 10));
  }, []);
  
  // 处理导航点击
  const handleNavClick = (path: string) => {
    navigate(path);
    toast(`导航到${path === '/patient' ? '首页' : path.substring(8)}`);
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
  
  // 处理快速入口点击
  const handleQuickAccessClick = (type: string) => {
    switch (type) {
      case 'aiCheck':
        toast('AI自查功能即将上线');
        break;
      case 'myRecords':
        navigate('/patient/records');
        break;
      case 'authManage':
        toast('授权管理功能即将上线');
        break;
      case 'smartSearch':
        toast('智能搜索功能即将上线');
        break;
      default:
        break;
    }
  };
  
  // 处理通知操作
  const handleNotificationAction = (notificationId: string, action: 'approve' | 'reject' | 'view') => {
    const notification = notificationItems.find(item => item.id === notificationId);
    if (!notification) return;
    
    switch (action) {
      case 'approve':
        toast(`已同意 ${notification.doctorName} 的授权请求`);
        break;
      case 'reject':
        toast(`已拒绝 ${notification.doctorName} 的授权请求`);
        break;
      case 'view':
        navigate('/patient/records');
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-[64px] bg-gradient-to-r from-[#fff] to-[#059669] fixed top-0 left-0 right-0 z-10 shadow-md">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between">
          {/* 左侧 Logo */}
          {/* <div className="text-2xl font-bold text-white">健康助手</div> */}
          <div className="text-2xl font-bold text-green-600 flex gap-5 items-center"><img src="src/picture/nav.png" style={{width:'100px'}} alt="yidianjiutong"  />医点就通</div>
          
          {/* 中间导航菜单 */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('/patient/profile')}
              className="text-white hover:text-white/80 transition-colors"
            >
              个人中心
            </button>
            <button
              onClick={() => handleNavClick('/patient/records')}
              className="text-white hover:text-white/80 transition-colors"
            >
              我的病历
            </button>
             <button
              onClick={() => navigate('/patient/ai-chat')}
              className="text-white hover:text-white/80 transition-colors"
            >
              AI自查
            </button>
            <button
              onClick={() => handleQuickAccessClick('authManage')}
              className="text-white hover:text-white/80 transition-colors"
            >
              授权管理
            </button>
          </nav>
          
           {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="px-3 py-1.5 border border-white/30 text-white rounded hover:bg-white/10 transition-colors text-sm hidden md:block"
            >
              退出登录
            </button>
            
            <button 
              onClick={handleNotificationClick} 
              className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="通知"
            >
              <Bell className="text-white" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-medium">
              李
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <main className="flex-grow pt-[64px] px-[40px] py-[32px] max-w-[1440px] mx-auto w-full">
        {/* 欢迎信息卡片 */}
        <div className="mb-8">
          <div className="bg-[#10B981] rounded-[16px] p-6 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <User size={24} />
              <h1 className="text-[28px] font-bold">李明，{greeting}！</h1>
            </div>
            <p className="text-[16px] mt-2 text-white/90">您的健康档案一切正常</p>
          </div>
        </div>
        
        {/* 健康数据概览 */}
        <div className="mb-8">
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">健康数据概览</h2>
          <div className="flex flex-wrap gap-6">
            {/* 病历档案卡片 */}
            <div className="w-[340px] h-[180px] bg-white rounded-[16px] p-6 shadow-md flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3">
                <FileText size={24} />
              </div>
              <h3 className="text-gray-600 text-lg mb-2">病历档案</h3>
              <div className="text-4xl font-bold text-gray-900">15</div>
              <p className="text-gray-600 mt-1">份病历</p>
            </div>
            
            {/* 最近就诊卡片 */}
            <div className="w-[340px] h-[180px] bg-white rounded-[16px] p-6 shadow-md flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                <CalendarIcon size={24} />
              </div>
              <h3 className="text-gray-600 text-lg mb-2">最近就诊</h3>
              <div className="text-xl font-bold text-gray-900">2025-01-10</div>
              <p className="text-gray-600 mt-1">XX口腔医院</p>
            </div>
            
            {/* 健康评分卡片 */}
            <div className="w-[340px] h-[180px] bg-white rounded-[16px] p-6 shadow-md flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="text-gray-600 text-lg mb-2">健康评分</h3>
              <div className="text-4xl font-bold text-gray-900">85/100</div>
              <p className="text-gray-600 mt-1">良好</p>
            </div>
          </div>
        </div>
        
        {/* 快速入口 */}
        <div className="mb-8">
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">快速入口</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* AI自查 */}
            <button 
              className="w-[160px] h-[160px] bg-white rounded-[12px] shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
              onClick={() => handleQuickAccessClick('aiCheck')}
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3">
                <Brain size={48} />
              </div>
              <span className="font-medium text-gray-800">AI自查</span>
            </button>
            
            {/* 我的病历 */}
            <button 
              className="w-[160px] h-[160px] bg-white rounded-[12px] shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
              onClick={() => handleQuickAccessClick('myRecords')}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                <FileText size={48} />
              </div>
              <span className="font-medium text-gray-800">我的病历</span>
            </button>
            
            {/* 授权管理 */}
            <button 
              className="w-[160px] h-[160px] bg-white rounded-[12px] shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
              onClick={() => handleQuickAccessClick('authManage')}
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3">
                <Shield size={48} />
              </div>
              <span className="font-medium text-gray-800">授权管理</span>
            </button>
            
            {/* 智能搜索 */}
            <button 
              className="w-[160px] h-[160px] bg-white rounded-[12px] shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
              onClick={() => handleQuickAccessClick('smartSearch')}
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-3">
                <SearchIcon size={48} />
              </div>
              <span className="font-medium text-gray-800">智能搜索</span>
            </button>
          </div>
        </div>
        
         {/* 通知中心 */}
         <div className="mb-8">
           <h2 className="text-[18px] font-bold text-gray-900 mb-4">通知中心 (2)</h2>
           <div className="space-y-4">
             {notificationItems.map((item) => (
               <div 
                 key={item.id} 
                 className="bg-white rounded-lg p-4 shadow-md border border-gray-100"
               >
                 <div className="flex items-start">
                   <div className="mr-3 mt-1">{item.icon}</div>
                   <div className="flex-1">
                     <p className="font-medium text-gray-900">{item.title}</p>
                     <p className="text-gray-600 text-sm mt-1">{item.details}</p>
                     {item.time && (
                       <p className="text-gray-500 text-sm mt-1">时间: {item.time}</p>
                     )}
                   </div>
                   <div className="ml-4">
                     {item.type === 'authorization' ? (
                       <div className="flex gap-2">
                         <button 
                           className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
                           onClick={() => handleNotificationAction(item.id, 'reject')}
                         >
                           拒绝
                         </button>
                         <button 
                           className="px-3 py-1 bg-green-100 text-green-600 rounded text-sm hover:bg-green-200 transition-colors"
                           onClick={() => handleNotificationAction(item.id, 'approve')}
                         >
                           同意
                         </button>
                       </div>
                     ) : (
                       <button 
                         className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 transition-colors"
                         onClick={() => handleNotificationAction(item.id, 'view')}
                       >
                         查看详情
                       </button>
                     )}
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
        
        {/* 健康日历 */}
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">健康日历</h2>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">2025年1月</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  &lt;
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  今天
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  &gt;
                </button>
              </div>
            </div>
            
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                <div key={index} className="text-center text-gray-600 font-medium text-sm py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日历格子 */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`
                    aspect-square flex items-center justify-center rounded-lg text-sm
                    ${day === null ? 'text-gray-200' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}
                    ${day === 10 ? 'bg-green-100 text-green-700 border-2 border-green-500 font-medium' : ''}
                  `}
                >
                  {day}
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-500 italic">
              ← 10号有就诊记录
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}