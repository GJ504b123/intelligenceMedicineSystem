import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileCheck, Bell, Search } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 类型定义
interface VerificationRecord {
  id: string;
  certificateNumber: string;
  date: string;
  result: 'pass' | 'fail';
}

// 模拟最近验证的证书数据
const recentVerificationRecords: VerificationRecord[] = [
  {
    id: '1',
    certificateNumber: 'CERT-2025011514321800123456',
    date: '2025-01-15',
    result: 'pass'
  },
  {
    id: '2',
    certificateNumber: 'CERT-2025011410253700654321',
    date: '2025-01-14',
    result: 'pass'
  },
  {
    id: '3',
    certificateNumber: 'CERT-2025011309182600987654',
    date: '2025-01-13',
    result: 'fail'
  }
];

export default function CertificateVerifyPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('CERT-2025011514321800123456');
  // 获取当前日期并格式化



  // 处理证书编号输入变化
  const handleCertificateNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCertificateNumber(e.target.value);
  };

  // 处理扫描二维码
  const handleScanQRCode = () => {
    toast('二维码扫描功能即将上线');
    // 实际应用中这里应该调用摄像头或打开文件选择器
  };

  // 处理验证按钮点击
  const handleVerify = () => {
    if (!certificateNumber.trim()) {
      toast('请输入证书编号');
      return;
    }

    // 简单的格式验证
    const certPattern = /^CERT-\d{14}\d{8}$/;
    if (!certPattern.test(certificateNumber)) {
      toast('证书编号格式不正确，请按照CERT-YYYYMMDDHHMMSS+8位随机数的格式输入');
      return;
    }

    // 模拟验证过程，50%概率验证成功
    const isVerified = Math.random() > 0.5;
    
    // 导航到验证结果页面
    navigate('/verify/result');
    toast(isVerified ? '验证成功' : '验证失败');
  };

  // 查看验证详情
  const handleViewDetails = (record: VerificationRecord) => {
    setCertificateNumber(record.certificateNumber);
    toast(`查看证书 ${record.certificateNumber} 的验证详情`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}

      
      {/* 主内容区域 */}
      <main className="flex-grow pt-[24px] px-[40px] py-[32px] max-w-[1440px] mx-auto w-full">
        {/* 证书编号验证标题 */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-900">证书编号验证</h1>
          <p className="text-gray-600 mt-2">今天是 {currentDate}</p>
        </div>
        
        {/* 证书编号验证区域 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* 输入区域 */}
            <div>
              <label htmlFor="certificateNumber" className="block text-lg font-medium text-gray-900 mb-3">
                输入数字存证证书编号
              </label>
              
              <input
                type="text"
                id="certificateNumber"
                value={certificateNumber}
                onChange={handleCertificateNumberChange}
                className="w-full h-[56px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-[18px] font-mono"
                placeholder="请输入证书编号"
              />
            </div>
            
            {/* 分隔线 */}
            <div className="flex items-center">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="px-4 text-gray-500">或</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
            
            {/* 扫描二维码按钮 */}
            <div className="flex justify-center">
              <button
                onClick={handleScanQRCode}
                className="w-[200px] h-[56px] border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-2xl">📷</span>
                <span className="font-medium">扫描证书二维码</span>
              </button>
            </div>
            
            {/* 格式说明 */}
            <div className="text-center">
              <p className="text-[14px] text-[#6B7280]">
                证书编号格式: CERT-YYYYMMDDHHMMSS + 8位随机数
              </p>
            </div>
            
            {/* 验证按钮 */}
            <div className="flex justify-end">
              <button
                onClick={handleVerify}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                验证
              </button>
            </div>
          </div>
        </div>
        
        {/* 最近验证的证书 */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[18px] font-bold text-gray-900 mb-4">最近验证的证书</h2>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {recentVerificationRecords.map((record) => (
              <div
                key={record.id}
                className="h-[56px] flex items-center justify-between px-6 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewDetails(record)}
              >
                <div className="font-mono text-gray-900 truncate max-w-[300px]">
                  {record.certificateNumber}
                </div>
                <div className="text-gray-600">
                  {record.date}
                </div>
                <div className={`
                  px-2 py-1 rounded-full text-sm font-medium
                  ${record.result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                `}>
                  {record.result === 'pass' ? '✓通过' : '✗失败'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}