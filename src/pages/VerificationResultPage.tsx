import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X, AlertTriangle, ArrowLeft, RefreshCw, PhoneCall, Bell } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

export default function VerificationResultPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
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
    toast(`导航到${path === '/verify' ? '验证中心' : path.substring(7)}`);
  };
  
  // 处理通知点击
  const handleNotificationClick = () => {
    toast('您有新的通知');
  };

  // 重新验证
  const handleReverify = () => {
    navigate('/verify/files');
    toast('开始重新验证');
  };

  // 联系客服
  const handleContactSupport = () => {
    toast('正在连接客服，请稍候...');
    // 实际应用中这里应该打开客服聊天窗口或显示客服联系方式
  };

  // 返回
  const handleBack = () => {
    navigate('/verify/files');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-[64px] bg-[#1E293B] fixed top-0 left-0 right-0 z-10 shadow-md">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between">
          {/* 左侧 Logo */}
          {/* <div className="text-2xl font-bold text-white">验证服务中心</div> */}
          
          {/* 中间导航菜单 */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('/verify')}
              className="text-white/70 hover:text-white transition-colors"
            >
              验证中心
            </button>
            <button
              onClick={() => handleNavClick('/verify/records')}
              className="text-white/70 hover:text-white transition-colors"
            >
              验证记录
            </button>
            <button
              onClick={() => handleNavClick('/verify/statistics')}
              className="text-white/70 hover:text-white transition-colors"
            >
              统计分析
            </button>
            <button
              onClick={() => handleNavClick('/verify/organization')}
              className="text-white/70 hover:text-white transition-colors"
            >
              机构管理
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
              验
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <main className="flex-grow pt-[64px] px-[40px] py-[32px] max-w-[1440px] mx-auto w-full">
        {/* 验证结果标题 */}
        <div className="mb-8">
          <div className="flex items-center">
            <ArrowLeft size={20} className="text-gray-600 mr-2 cursor-pointer" onClick={handleBack} />
            <h1 className="text-[28px] font-bold text-gray-900">验证结果</h1>
          </div>
          <p className="text-gray-600 mt-2">今天是 {currentDate}</p>
        </div>
        
        {/* 验证失败卡片 */}
        <div className="mb-8">
          <div className="h-[200px] bg-[#FEE2E2] border-2 border-[#EF4444] rounded-[12px] p-8 flex flex-col items-center justify-center">
            <div className="text-[#EF4444] text-5xl font-bold mb-4">✗</div>
            <h2 className="text-[24px] font-bold text-[#EF4444] mb-2">验证失败</h2>
            <p className="text-[16px] text-[#6B7280] text-center">该文件可能已被篡改或不存在存证记录</p>
          </div>
        </div>
        
        {/* 失败原因 */}
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-gray-900 mb-4">失败原因</h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4 text-[#EF4444]">
              <AlertTriangle size={20} />
              <h4 className="font-medium">文件哈希值不匹配</h4>
            </div>
            
            <div className="space-y-4 mb-4">
              <div>
                <p className="text-gray-700 mb-1">当前文件哈希:</p>
                <div className="bg-gray-50 p-3 rounded-md font-mono text-gray-900 overflow-x-auto">
                  9f3e2d1c8b7a6e5f4d3c2b1a0e9f8d7c6b5a4e3d2c1b0a9f8e
                </div>
              </div>
              
              <div>
                <p className="text-gray-700 mb-1">原始存证哈希:</p>
                <div className="bg-gray-50 p-3 rounded-md font-mono text-gray-900 overflow-x-auto">
                  7b2e4f1a9c3d8e5f2a1b4c6d9e8f7a3b2c1d0e9f8d7c6b5a4e
                </div>
              </div>
            </div>
            
            <p className="text-gray-700">这表明文件内容已被修改</p>
          </div>
        </div>
        
        {/* 可能的原因 */}
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-gray-900 mb-4">可能的原因:</h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold">•</span>
                <span className="text-gray-700">文件在存证后被编辑或修改</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold">•</span>
                <span className="text-gray-700">上传的文件不是原始存证版本</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold">•</span>
                <span className="text-gray-700">文件在传输过程中损坏</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 建议操作 */}
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-gray-900 mb-4">建议操作:</h3>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold">•</span>
                <span className="text-gray-700">联系文件提供方确认文件来源</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold">•</span>
                <span className="text-gray-700">要求提供原始未修改版本</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900 font-bold">•</span>
                <span className="text-gray-700">如有疑问，请联系平台客服</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleReverify}
            className="w-[160px] h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            <span>重新验证</span>
          </button>
          <button
            onClick={handleContactSupport}
            className="w-[160px] h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <PhoneCall size={18} />
            <span>联系客服</span>
          </button>
          <button
            onClick={handleBack}
            className="w-[160px] h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>返回</span>
          </button>
        </div>
      </main>
    </div>
  );
}

