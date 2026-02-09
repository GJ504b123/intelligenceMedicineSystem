import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  BarChart2, FileCheck, X, Check, Bell, Search, 
  LayoutDashboard, ShieldCheck, Database, RefreshCw, Clock
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 统计数据
const statsData = {
  total: 28,
  passed: 26,
  failed: 2,
  passRate: 92.9,
  failRate: 7.1
};

// 验证记录
const verificationRecords = [
  { id: '1', time: '14:30', fileName: '病历报告_20250115.pdf', result: 'pass', hash: 'e3b0c44...' },
  { id: '2', time: '14:25', fileName: '口腔影像_Scan.jpg', result: 'pass', hash: 'a1b2c3d...' },
  { id: '3', time: '14:20', fileName: '诊断证明_篡改测试.pdf', result: 'fail', hash: 'Unknown' },
];

export default function ThirdPartyVerifyHome() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  


  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 侧边导航栏 - 第三方深色权威主题 */}


      {/* 主体内容 */}
      <main className="flex-1  p-10">

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium">今日验证请求</p>
                <h3 className="text-4xl font-bold text-[#1E293B] mt-2">{statsData.total}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BarChart2 size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium">验证通过</p>
                <h3 className="text-4xl font-bold text-green-600 mt-2">{statsData.passed}</h3>
                <p className="text-xs text-gray-400 mt-1">通过率 {statsData.passRate}%</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Check size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 font-medium">验证失败/篡改</p>
                <h3 className="text-4xl font-bold text-red-600 mt-2">{statsData.failed}</h3>
                <p className="text-xs text-gray-400 mt-1">风险率 {statsData.failRate}%</p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <X size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* 快速验证入口 */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div 
            onClick={() => navigate('/verify/files')}
            className="h-[160px] bg-white border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileCheck size={28} />
            </div>
            <h3 className="font-bold text-gray-700 text-lg">上传文件验真</h3>
            <p className="text-sm text-gray-400 mt-1">支持拖拽 PDF / 影像文件</p>
          </div>

          <div 
            onClick={() => navigate('/verify/certificate')}
            className="h-[160px] bg-white border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-bold text-gray-700 text-lg">数字证书编号查询</h3>
            <p className="text-sm text-gray-400 mt-1">输入 Hash 或 证书 ID</p>
          </div>
        </div>

        {/* 最新验证记录 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">实时验证日志</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">时间戳</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">文件名</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">文件指纹 (Hash)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">验证结果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {verificationRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{record.time}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{record.fileName}</td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-mono">{record.hash}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        record.result === 'pass' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {record.result === 'pass' ? '通过' : '篡改警报'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}