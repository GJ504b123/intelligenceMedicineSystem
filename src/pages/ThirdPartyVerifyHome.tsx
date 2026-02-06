import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BarChart2, FileCheck, X, Check, Bell, Search } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 类型定义
interface VerificationRecord {
  id: string;
  time: string;
  fileName: string;
  result: 'pass' | 'fail';
}

// 模拟验证记录数据
const verificationRecords: VerificationRecord[] = [
  {
    id: '1',
    time: '2025-01-15 14:30',
    fileName: '病历报告.pdf',
    result: 'pass'
  },
  {
    id: '2',
    time: '2025-01-15 14:25',
    fileName: '口腔影像.jpg',
    result: 'pass'
  },
  {
    id: '3',
    time: '2025-01-15 14:20',
    fileName: '诊断证明.pdf',
    result: 'fail'
  },
  {
    id: '4',
    time: '2025-01-15 14:15',
    fileName: '检查报告.pdf',
    result: 'pass'
  },
  {
    id: '5',
    time: '2025-01-15 14:10',
    fileName: '处方单.jpg',
    result: 'pass'
  }
];

// 统计数据
const statsData = {
  total: 28,
  passed: 26,
  failed: 2,
  passRate: 92.9,
  failRate: 7.1
};

export default function ThirdPartyVerifyHome() {
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
  
  // 处理验证方式选择
  const handleVerifyMethodSelect = (method: 'upload' | 'code') => {
    if (method === 'upload') {
      toast('请选择要验证的文件');
      // 实际应用中应该打开文件选择对话框
    } else {
      toast('请输入或扫描证书编号');
      // 实际应用中应该显示证书编号输入框
    }
  };
  
  // 查看验证详情
  const handleViewDetails = (recordId: string) => {
    toast(`查看验证记录 #${recordId} 的详情`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-[64px] bg-[#1E293B] fixed top-0 left-0 right-0 z-10 shadow-md">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between">
          {/* 左侧 Logo */}
          {/* <div className="text-2xl font-bold text-white">验证服务中心</div> */}
          <div className="text-2xl font-bold text-white flex gap-5 items-center"><img src="src/picture/nav.png" style={{width:'100px'}} alt="yidianjiutong"  />医点就通</div>
          
          {/* 中间导航菜单 */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('/verify')}
              className="text-white hover:text-white/80 transition-colors border-b-2 border-white"
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
        {/* 验证中心标题 */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-900">验证中心</h1>
          <p className="text-gray-600 mt-2">今天是 {currentDate}</p>
        </div>
        
        {/* 今日验证统计 */}
        <div className="mb-10">
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">今日验证统计</h2>
          <div className="flex flex-wrap gap-[24px]">
            {/* 今日验证总数卡片 */}
            <div className="w-[360px] h-[160px] bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-gray-600 text-lg mb-2">今日验证</h3>
              <div className="text-4xl font-bold text-gray-900">{statsData.total}</div>
            </div>
            
            {/* 验证通过卡片 */}
            <div className="w-[360px] h-[160px] bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3">
                <Check size={24} />
              </div>
              <h3 className="text-gray-600 text-lg mb-2">验证通过</h3>
              <div className="text-4xl font-bold text-gray-900">{statsData.passed}</div>
              <p className="text-gray-600 mt-1">({statsData.passRate}%)</p>
            </div>
            
            {/* 验证失败卡片 */}
            <div className="w-[360px] h-[160px] bg-white rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
                <X size={24} />
              </div>
              <h3 className="text-gray-600 text-lg mb-2">验证失败</h3>
              <div className="text-4xl font-bold text-gray-900">{statsData.failed}</div>
              <p className="text-gray-600 mt-1">({statsData.failRate}%)</p>
            </div>
          </div>
        </div>
        
        {/* 快速验证 */}
        <div className="mb-10">
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">快速验证</h2>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-6">选择验证方式:</h3>
            <div className="flex flex-wrap gap-6">
               {/* 上传文件验证 */}
              <div 
                className="w-[280px] h-[200px] bg-white border border-gray-200 rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center"
                onClick={() => navigate('/verify/files')}
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <FileCheck size={32} />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">上传文件验证</h4>
                <p className="text-sm text-gray-600 text-center">支持批量上传</p>
              </div>
              
              {/* 证书编号验证 */}
              <div 
                className="w-[280px] h-[200px] bg-white border border-gray-200 rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center"
                onClick={() => navigate('/verify/certificate')}
              >
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                  <span className="text-2xl font-bold">🔢</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">证书编号验证</h4>
                <p className="text-sm text-gray-600 text-center">输入或扫描编号</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 最近验证记录 */}
        <div>
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">最近验证记录</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件名
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      结果
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verificationRecords.map((record, index) => (
                    <tr 
                      key={record.id} 
                      className={`h-[48px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {record.time}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {record.fileName}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.result === 'pass' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.result === 'pass' ? '✓ 通过' : '✗ 失败'}
                        </span>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          onClick={() => handleViewDetails(record.id)}
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}