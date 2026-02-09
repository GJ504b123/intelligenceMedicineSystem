import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FileCheck, X, Bell, Trash2, Upload, FileText, 
  Image, CheckCircle, Clock, ShieldCheck, Database, 
  LayoutDashboard, BarChart2, RefreshCw, Loader2, 
  ScanLine, FileCode, Lock, Terminal, Check
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 模拟验证日志步骤
const VERIFY_LOGS = [
  { step: 1, text: '正在初始化安全沙箱环境...', delay: 800 },
  { step: 2, text: '正在读取文件二进制数据流...', delay: 1500 },
  { step: 3, text: '计算文件 SHA-256 数字指纹...', delay: 2500 },
  { step: 4, text: '正在连接区块链存证节点 (Node: BJ-Core-04)...', delay: 3500 },
  { step: 5, text: '检索区块高度 #829,102 上的存证记录...', delay: 4500 },
  { step: 6, text: '比对数字签名与 CA 证书有效性...', delay: 5500 },
  { step: 7, text: '验证完成：文件指纹匹配，未发现篡改痕迹。', delay: 6500 },
];

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'waiting' | 'verifying' | 'completed' | 'failed';
  hash?: string;
}

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
  
  // 文件相关状态
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 验证过程状态
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(-1);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  
  useEffect(() => {
    const date = new Date();
    setCurrentDate(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
  }, []);

  // 处理文件选择
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let selectedFiles: FileList | null = null;
    
    if ('dataTransfer' in e) {
      e.preventDefault();
      setIsDragOver(false);
      selectedFiles = e.dataTransfer.files;
    } else {
      selectedFiles = (e.target as HTMLInputElement).files;
    }

    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles: FileItem[] = Array.from(selectedFiles).map((file, index) => ({
        id: Date.now() + index.toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'waiting'
      }));
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`已添加 ${newFiles.length} 个文件等待验证`);
    }
  };

  // 开始模拟验证过程
  const startVerification = (fileId: string) => {
    if (isVerifying) return;
    
    setActiveFileId(fileId);
    setIsVerifying(true);
    setCurrentLogIndex(0);
    
    // 将当前文件状态设为 verifying
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'verifying' } : f));

    // 启动日志序列
    let step = 0;
    const interval = setInterval(() => {
      if (step < VERIFY_LOGS.length) {
        setCurrentLogIndex(step);
        step++;
      } else {
        clearInterval(interval);
        finishVerification(fileId);
      }
    }, 800); // 每 0.8 秒显示一行日志
  };

  const finishVerification = (fileId: string) => {
    setIsVerifying(false);
    setFiles(prev => prev.map(f => f.id === fileId ? { 
      ...f, 
      status: 'completed',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' // 模拟的 Hash
    } : f));
    toast.success('文件验证通过！');
  };

  const clearList = () => {
    setFiles([]);
    setCurrentLogIndex(-1);
    setIsVerifying(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 侧边导航栏 - 第三方深色主题 */}

      {/* 主体内容 */}
      <main className="flex-1  p-10">


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：上传与列表区 */}
          <div className="space-y-6">
            {/* 拖拽上传区 */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFilesSelected}
              className={`
                h-[200px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all
                ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'}
              `}
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Upload size={32} />
              </div>
              <p className="text-gray-700 font-bold text-lg">点击或拖拽文件到此处</p>
              <p className="text-gray-400 text-sm mt-1">支持 PDF, JPG, PNG, DICOM (最大 50MB)</p>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilesSelected} />
            </div>

            {/* 待验证列表 */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[300px]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <FileText size={18} /> 验证队列 ({files.length})
                </h3>
                {files.length > 0 && (
                  <button onClick={clearList} className="text-xs text-red-500 hover:underline">清空列表</button>
                )}
              </div>
              
              <div className="p-4 space-y-3">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                    <FileCode size={48} className="mb-2 opacity-20" />
                    <p>暂无文件</p>
                  </div>
                ) : (
                  files.map(file => (
                    <div key={file.id} className={`p-4 rounded-xl border transition-all ${
                      file.status === 'verifying' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-100 bg-white hover:border-gray-300'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          {file.status === 'completed' ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                              {file.name.endsWith('.pdf') ? <FileText size={20} /> : <Image size={20} />}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{file.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        {file.status === 'waiting' && (
                          <button 
                            onClick={() => startVerification(file.id)}
                            disabled={isVerifying}
                            className="px-4 py-1.5 bg-[#1E293B] text-white text-xs rounded-full hover:bg-black disabled:opacity-50 transition-colors"
                          >
                            开始验证
                          </button>
                        )}
                        {file.status === 'verifying' && <Loader2 className="animate-spin text-blue-600" size={20} />}
                        {file.status === 'completed' && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">通过</span>}
                      </div>
                      
                      {/* 如果已完成，显示 Hash */}
                      {file.status === 'completed' && (
                        <div className="mt-2 text-[10px] font-mono text-gray-400 bg-gray-50 p-2 rounded truncate">
                          Hash: {file.hash}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右侧：验证控制台 (录屏核心) */}
          <div className="bg-[#0F172A] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] border border-gray-700">
            {/* 终端头部 */}
            <div className="bg-[#1E293B] p-4 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-green-400" />
                <span className="text-sm font-mono text-gray-300">Verification_Console.exe</span>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* 终端内容区 */}
            <div className="flex-1 p-6 font-mono text-sm overflow-y-auto space-y-4">
              {!isVerifying && !activeFileId ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <ShieldCheck size={64} className="mb-4 opacity-20" />
                  <p>等待启动验证任务...</p>
                  <p className="text-xs mt-2">系统已连接至公信链节点</p>
                </div>
              ) : (
                <>
                  <div className="text-gray-400 pb-2 border-b border-gray-800 mb-4">
                    Target: <span className="text-blue-400">{files.find(f => f.id === activeFileId)?.name}</span>
                  </div>
                  
                  {VERIFY_LOGS.map((log, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start gap-3 transition-all duration-300 ${
                        index <= currentLogIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'
                      }`}
                    >
                      <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                      {index < VERIFY_LOGS.length - 1 ? (
                        <>
                          <span className="text-blue-500">➜</span>
                          <span className="text-gray-300">{log.text}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-green-500">✔</span>
                          <span className="text-green-400 font-bold">{log.text}</span>
                        </>
                      )}
                    </div>
                  ))}

                  {/* 正在进行时的光标动画 */}
                  {isVerifying && (
                    <div className="animate-pulse text-green-500 mt-2">_</div>
                  )}
                </>
              )}
            </div>
            
            {/* 底部状态栏 */}
            <div className="bg-[#1E293B] p-2 px-4 text-xs text-gray-500 flex justify-between border-t border-gray-700">
              <span>Status: {isVerifying ? 'PROCESSING' : 'IDLE'}</span>
              <span>Mem: 42% | CPU: 12%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}