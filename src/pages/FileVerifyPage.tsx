import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileCheck, X, Bell, Trash2, Upload, FileText, Image, CheckCircle, Clock } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 类型定义
interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'waiting' | 'verifying' | 'completed' | 'failed';
  progress: number;
  message?: string;
  verified?: boolean;
}

// 文件图标映射
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
    return <Image size={18} className="text-blue-500" />;
  } else if (['pdf'].includes(extension || '')) {
    return <FileText size={18} className="text-red-500" />;
  }
  return <FileCheck size={18} className="text-gray-500" />;
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function FileVerifyPage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: '病历报告.pdf',
      size: 2.3 * 1024 * 1024, // 2.3MB
      type: 'application/pdf',
      status: 'verifying',
      progress: 60,
      message: '正在计算文件哈希值...'
    },
    {
      id: '2',
      name: '口腔影像.jpg',
      size: 1.8 * 1024 * 1024, // 1.8MB
      type: 'image/jpeg',
      status: 'waiting',
      progress: 0
    }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
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
  
  // 模拟验证进度
  useEffect(() => {
    const verifyingFile = files.find(file => file.status === 'verifying');
    if (!verifyingFile) return;
    
    const timer = setInterval(() => {
      setFiles(prevFiles => 
        prevFiles.map(file => {
          if (file.id === verifyingFile.id && file.progress < 100) {
            const newProgress = file.progress + 5;
            return {
              ...file,
              progress: newProgress,
               status: newProgress === 100 ? 'completed' : 'verifying',
               message: newProgress === 100 ? '验证完成' : '正在计算文件哈希值...',
               verified: newProgress === 100
            };
          }
          return file;
        })
      );
    }, 1000);
    
    return () => clearInterval(timer);
  }, [files]);
  
  // 处理导航点击
  const handleNavClick = (path: string) => {
    navigate(path);
    toast(`导航到${path === '/verify' ? '验证中心' : path.substring(7)}`);
  };
  
  // 处理通知点击
  const handleNotificationClick = () => {
    toast('您有新的通知');
  };
  
  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles: FileItem[] = [];
      const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'dicom'];
      
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        // 检查文件格式是否支持
        if (extension && validExtensions.includes(extension)) {
          newFiles.push({
            id: Date.now() + i.toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'waiting',
            progress: 0
          });
        } else {
          toast(`不支持的文件格式: ${file.name}`);
        }
      }
      
      // 检查文件数量限制
      if (files.length + newFiles.length > 20) {
        toast('最多支持20个文件同时验证');
        const remainingSlots = 20 - files.length;
        if (remainingSlots > 0) {
          setFiles([...files, ...newFiles.slice(0, remainingSlots)]);
        }
      } else {
        setFiles([...files, ...newFiles]);
      }
    }
  };
  
  // 处理文件选择
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileItem[] = [];
      const validExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'dicom'];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        // 检查文件格式是否支持
        if (extension && validExtensions.includes(extension)) {
          newFiles.push({
            id: Date.now() + i.toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'waiting',
            progress: 0
          });
        } else {
          toast(`不支持的文件格式: ${file.name}`);
        }
      }
      
      // 检查文件数量限制
      if (files.length + newFiles.length > 20) {
        toast('最多支持20个文件同时验证');
        const remainingSlots = 20 - files.length;
        if (remainingSlots > 0) {
          setFiles([...files, ...newFiles.slice(0, remainingSlots)]);
        }
      } else {
        setFiles([...files, ...newFiles]);
      }
    }
  };
  
  // 删除文件
  const handleDeleteFile = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    toast('文件已从待验证列表中移除');
  };
  
  // 清空列表
  const handleClearList = () => {
    if (files.some(file => file.status === 'verifying')) {
      toast('有文件正在验证中，无法清空列表');
      return;
    }
    setFiles([]);
    toast('待验证列表已清空');
  };
  
  // 开始验证
  const handleStartVerification = () => {
    const waitingFiles = files.filter(file => file.status === 'waiting');
    if (waitingFiles.length === 0) {
      toast('没有等待验证的文件');
      return;
    }
    
    // 开始第一个等待验证的文件
    setFiles(prevFiles => 
      prevFiles.map((file, index) => {
        if (file.status === 'waiting' && index === prevFiles.findIndex(f => f.status === 'waiting')) {
          return { ...file, status: 'verifying', progress: 10, message: '正在计算文件哈希值...' };
        }
        return file;
      })
    );
    
    toast('开始验证文件');
  };
  
  // 获取状态显示文本
  const getStatusText = (status: FileItem['status']) => {
    switch (status) {
      case 'waiting':
        return '⏸ 等待验证';
      case 'verifying':
        return '🔄 验证中...';
       case 'completed':
         // 模拟验证结果，50%概率验证成功，50%概率验证失败
         const isVerified = Math.random() > 0.5;
         // 实际应用中，这里应该根据真实的验证结果来决定跳转到哪个页面
         setTimeout(() => {
           if (isVerified) {
             // 验证成功，这里应该跳转到验证成功页面
             // 由于用户只提供了验证失败页面，这里暂时也跳转到验证失败页面
             navigate('/verify/result');
           } else {
             // 验证失败，跳转到验证失败页面
             navigate('/verify/result');
           }
         }, 1000);
         return '✅ 验证完成';
      case 'failed':
        return '❌ 验证失败';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-[64px] bg-[#1E293B] fixed top-0 left-0 right-0 z-10 shadow-md">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between">
          {/* 左侧 Logo */}
          <div className="text-2xl font-bold text-white">验证服务中心</div>
          
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
        {/* 文件验证标题 */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-900">文件验证</h1>
          <p className="text-gray-600 mt-2">今天是 {currentDate}</p>
        </div>
        
        {/* 拖拽上传区域 */}
        <div 
          ref={dropAreaRef}
          className={`
            mb-8 border-2 border-dashed rounded-[12px] p-8 flex flex-col items-center justify-center
            transition-all h-[300px] cursor-pointer
            ${isDragOver 
              ? 'border-green-500 bg-green-50' 
              : 'border-[#94A3B8] bg-white'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
        >
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
            <Upload size={32} />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">拖拽文件到此处验证</h2>
          <p className="text-gray-600 mb-4">或点击选择文件</p>
          <p className="text-sm text-gray-500">支持格式: PDF, DOCX, JPG, PNG, DICOM</p>
          <p className="text-sm text-gray-500">支持批量验证，最多20个文件</p>
          
          {/* 隐藏的文件输入框 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.jpg,.jpeg,.png,.dicom"
            className="hidden"
            onChange={handleFilesSelected}
          />
        </div>
        
        {/* 待验证文件列表 */}
        {files.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">待验证文件 ({files.length})</h2>
            
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getFileIcon(file.name)}
                      </div>
                      <div>
                        <div className="text-gray-900 font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`
                        text-sm font-medium mr-4
                        ${file.status === 'waiting' ? 'text-yellow-600' : ''}
                        ${file.status === 'verifying' ? 'text-blue-600' : ''}
                        ${file.status === 'completed' ? 'text-green-600' : ''}
                        ${file.status === 'failed' ? 'text-red-600' : ''}
                      `}>
                        {getStatusText(file.status)}
                      </span>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        disabled={file.status === 'verifying'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {file.status === 'verifying' && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {file.message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleClearList}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mr-3"
              >
                清空列表
              </button>
              <button
                onClick={handleStartVerification}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                开始验证
              </button>
            </div>
          </div>
        )}
        
        {/* 空状态提示 */}
        {files.length === 0 && (
          <div className="flex justify-center items-center h-[300px] bg-white rounded-lg border border-dashed border-gray-200">
            <div className="text-center">
              <Upload size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无待验证文件，请上传需要验证的文件</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}