import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Bell, Search, ArrowLeft, ArrowRight, FileText, FileImage, Trash2, AlertTriangle, CheckCircle, Shield, Info, Lock, Calendar } from 'lucide-react';
import { AuthContext } from '@/contexts/authContext';
import { useContext } from 'react';

// 类型定义
interface Step {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'pending';
}

interface PatientInfo {
  name: string;
  gender: string;
  age: number;
  idCard: string;
  phone: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'failed';
  progress?: number;
  aiSummary?: string;
  category?: string;
  hash?: string; // 文件哈希值
}

// 导航链接
const navLinks = [
  { name: '工作台', path: '/' },
  { name: '患者管理', path: '/patients' },
  { name: '病历管理', path: '/records' },
  { name: '存证中心', path: '/evidence' }
];

// 步骤定义
const steps: Step[] = [
  { id: 1, title: '基本信息', status: 'completed' },
  { id: 2, title: '上传文件', status: 'completed' },
  { id: 3, title: 'AI分析', status: 'completed' },
  { id: 4, title: '存证确认', status: 'current' }
];

// 文件分类选项
const fileCategories = ['影像资料', '诊断报告', '处方单', '其他'];

export default function RecordCreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const params = useParams();
  const patientId = params.patientId || '1'; // 默认使用ID为1的患者
  
  // 状态管理
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '李明',
    gender: '男',
    age: 32,
    idCard: '110***********1234',
    phone: '138****5678'
  });
  
  // 更新文件状态为已完成并添加哈希值
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: '口腔全景片.jpg',
      size: 2.3,
      type: 'image/jpeg',
      status: 'completed',
      category: '影像资料',
      hash: '3a5f8c9d2e1b...'
    },
    {
      id: '2',
      name: '病历报告.pdf',
      size: 1.8,
      type: 'application/pdf',
      status: 'completed',
      aiSummary: '患者主诉牙痛，建议根管治疗...',
      category: '诊断报告',
      hash: '7b2e4f1a9c3d...'
    },
    {
      id: '3',
      name: '知情同意书.pdf',
      size: 0.5,
      type: 'application/pdf',
      status: 'completed',
      category: '其他',
      hash: '9d4c2a8f5e1b...'
    }
  ]);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  
  // 电子签名相关状态
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 存证信息
  const evidenceInfo = {
    timestamp: '2025-01-15 14:32:18',
    doctorName: '张医生',
    doctorLicense: '110101199001011234',
    hospital: 'XX口腔医院'
  };
  
  // 获取当前日期并格式化
  useEffect(() => {
    // 这里可以根据patientId从API获取患者信息
    // 这里使用模拟数据
  }, [patientId]);
  
  // 处理导航点击
  const handleNavClick = (path: string) => {
    navigate(path);
    toast(`导航到${path === '/' ? '工作台' : path.substring(1)}`);
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
  
  // 处理步骤点击
  const handleStepClick = (stepId: number) => {
    // 只允许点击已完成或当前步骤
    const step = steps.find(s => s.id === stepId);
    if (step && (step.status === 'completed' || step.status === 'current')) {
      // 跳转到对应步骤
      if (stepId === 1) {
        toast('跳转到基本信息页面');
      } else if (stepId === 2) {
        toast('跳转到上传文件页面');
      } else if (stepId === 3) {
        toast('跳转到AI分析页面');
      }
    }
  };
  
  // 处理文件拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // 实际应用中应该处理文件上传逻辑
      toast(`已拖入 ${e.dataTransfer.files.length} 个文件，准备上传`);
    }
  };
  
  // 处理文件选择
  const handleFileSelect = () => {
    fileInput?.click();
  };
  
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // 实际应用中应该处理文件上传逻辑
      toast(`已选择 ${e.target.files.length} 个文件，准备上传`);
    }
  };
  
  // 处理文件删除
  const handleFileDelete = (fileId: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    toast('文件已删除');
  };
  
  // 处理文件分类更改
  const handleCategoryChange = (fileId: string, category: string) => {
    setUploadedFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId ? { ...file, category } : file
      )
    );
  };
  
  // 处理查看AI摘要详情
  const handleViewSummary = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file?.aiSummary) {
      toast(file.aiSummary);
    }
  };
  
  // 电子签名相关函数
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    setHasSignature(true);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };
  
  const useSavedSignature = () => {
    toast('已使用保存的签名');
    setHasSignature(true);
    // 在实际应用中，这里应该加载用户已保存的签名
  };
  
  // 处理上一步按钮点击
  const handlePrevStep = () => {
    toast('返回AI分析页面');
  };
  
  // 处理完成并提交存证
  const handleSubmitEvidence = () => {
    if (!hasSignature) {
      toast('请先完成电子签名');
      return;
    }
    
    toast('存证提交成功！病历已创建完成');
    // 实际应用中应该提交数据到服务器并跳转到成功页面
    // navigate('/records/success');
  };
  
  // 格式化文件大小
  const formatFileSize = (size: number) => {
    return `${size}MB`;
  };
  
  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <FileImage className="text-blue-500" size={18} />;
    }
    return <FileText className="text-gray-500" size={18} />;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-[64px] bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between">
          {/* 左侧 Logo */}
          <div className="text-2xl font-bold text-blue-600">医疗管理系统</div>
          
          {/* 中间导航菜单 */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  link.path === '/' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>
          
          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                placeholder="搜索..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </form>
            
            <button 
              onClick={handleNotificationClick} 
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="text-gray-700" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 border border-red-500 text-red-600 rounded hover:bg-red-50 transition-colors text-sm hidden md:block"
            >
              退出登录
            </button>
            
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
              张
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <main className="flex-grow pt-[64px] px-[40px] py-[32px] max-w-[1440px] mx-auto w-full">
        {/* 面包屑导航 */}
        <div className="mb-6 text-sm">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-600 hover:text-blue-600">
                  工作台
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <a href="/patients" className="text-gray-600 hover:text-blue-600">
                    患者管理
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <a href={`/patients/${patientId}`} className="text-gray-600 hover:text-blue-600">
                    {patientInfo.name}
                  </a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">新建病历</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        {/* 主要内容布局 */}
        <div className="flex gap-6">
          {/* 左侧步骤导航 */}
          <div className="w-[240px] bg-white border border-gray-200 rounded-lg p-6 h-fit">
            <h2 className="text-lg font-bold mb-6 text-gray-900">创建病历步骤</h2>
            <ul className="space-y-6">
              {steps.map((step) => (
                <li 
                  key={step.id} 
                  className="flex items-start cursor-pointer"
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0
                    ${step.status === 'completed' ? 'bg-green-100 text-green-600' : ''}
                    ${step.status === 'current' ? 'bg-blue-600 text-white' : ''}
                    ${step.status === 'pending' ? 'bg-gray-100 text-gray-400' : ''}
                  `}>
                    {step.status === 'completed' ? '✓' : step.id}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      step.status === 'completed' ? 'text-green-600' : ''
                    } ${step.status === 'current' ? 'text-blue-600' : ''}
                    ${step.status === 'pending' ? 'text-gray-400' : ''}`}>
                      {step.title}
                    </div>
                    {step.status === 'completed' && (
                      <div className="text-xs text-gray-500 mt-1">已完成</div>
                    )}
                    {step.status === 'current' && (
                      <div className="text-xs text-blue-600 mt-1">进行中</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 右侧内容区域 */}
          <div className="flex-1 min-w-[800px] bg-white border border-gray-200 rounded-lg p-6">
             {/* 步骤标题 */}
            <h2 className="text-xl font-bold mb-6 text-gray-900">第四步: 数字存证确认</h2>
            
            {/* 病历摘要 */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-gray-900">病历摘要</h3>
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">患者:</span>
                    <span className="text-gray-900">{patientInfo.name}</span>
                    <span className="text-gray-500">|</span>
                    <span className="font-medium text-gray-700">性别:</span>
                    <span className="text-gray-900">{patientInfo.gender}</span>
                    <span className="text-gray-500">|</span>
                    <span className="font-medium text-gray-700">年龄:</span>
                    <span className="text-gray-900">{patientInfo.age}岁</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">病历类型:</span>
                    <span className="text-gray-900">初诊</span>
                    <span className="text-gray-500">|</span>
                    <span className="font-medium text-gray-700">就诊日期:</span>
                    <span className="text-gray-900">2025-01-15</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">诊断:</span>
                    <span className="text-gray-900">急性牙髓炎</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">上传文件:</span>
                    <span className="text-gray-900">{uploadedFiles.length}个 (影像1, 报告1, 知情同意书1)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 存证信息 */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-gray-900">存证信息</h3>
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-center gap-2 mb-4 text-blue-600">
                  <Shield size={20} />
                  <h4 className="font-medium">数字存证服务</h4>
                </div>
                
                <p className="mb-4 text-gray-700">系统将为以下文件生成防篡改存证证书:</p>
                
                {/* 存证文件列表 */}
                <div className="space-y-4 mb-6">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-gray-900">{file.name}</span>
                      </div>
                      <div className="pl-6 text-sm text-gray-500">文件哈希: {file.hash}</div>
                    </div>
                  ))}
                </div>
                
                {/* 存证详情 */}
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500 flex-shrink-0" />
                    <span className="font-medium">存证时间:</span>
                    <span>{evidenceInfo.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500 flex-shrink-0" />
                    <span className="font-medium">存证医生:</span>
                    <span>{evidenceInfo.doctorName} (执业证号: {evidenceInfo.doctorLicense})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-gray-500 flex-shrink-0" />
                    <span className="font-medium">存证机构:</span>
                    <span>{evidenceInfo.hospital}</span>
                  </div>
                </div>
                
                {/* 提示信息 */}
                <div className="mt-6 flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">存证后文件将无法修改，请确认信息准确无误</p>
                </div>
              </div>
            </div>
            
            {/* 电子签名 */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-gray-900">电子签名</h3>
              <div className="border border-gray-200 rounded-lg p-6 bg-white">
                {/* 签名区域 */}
                <div className="flex flex-col items-center mb-4">
                  <div 
                    className="w-[300px] h-[150px] border-2 border-gray-300 rounded-lg bg-white relative overflow-hidden"
                    style={{ touchAction: 'none' }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={150}
                      className="w-full h-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    {!hasSignature && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                        点击并拖动进行签名
                      </div>
                    )}
                  </div>
                  
                  {/* 签名操作按钮 */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={clearSignature}
                      className="px-4 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      清除
                    </button>
                    <button
                      onClick={useSavedSignature}
                      className="px-4 py-1 border border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                    >
                      使用已保存签名
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 确认选项 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-green-100 border border-green-300 rounded flex items-center justify-center text-green-600">
                  <CheckCircle size={14} />
                </div>
                <span className="text-gray-700">我确认以上信息准确无误</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-green-100 border border-green-300 rounded flex items-center justify-center text-green-600">
                  <CheckCircle size={14} />
                </div>
                <span className="text-gray-700">我同意对本病历进行数字存证</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 border border-green-300 rounded flex items-center justify-center text-green-600">
                  <CheckCircle size={14} />
                </div>
                <span className="text-gray-700">我已告知患者相关信息并获得同意</span>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handlePrevStep}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                上一步
              </button>
              <button
                onClick={handleSubmitEvidence}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                完成并提交存证
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}