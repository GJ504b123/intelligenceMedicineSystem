import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, CheckCircle, Shield, Info, Lock, 
  Loader2, Fingerprint, FileCheck, 
  LayoutDashboard, Users, TrendingUp, ShieldCheck, FileText,
  RefreshCw, ScanLine, Activity // 使用 Activity 代替 Brain
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

export default function RecordCreatePage() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  
  // 状态管理
  const [isChecking, setIsChecking] = useState(false); // 正在稽核
  const [checkStep, setCheckStep] = useState(0); // 稽核进度
  const [isCheckPassed, setIsCheckPassed] = useState(false); // 稽核是否通过
  
  const [isSubmitting, setIsSubmitting] = useState(false); // 正在提交存证
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. 智能合规性稽核 (录屏高光时刻：替代之前的 AI 分析)
  const handleSmartCheck = () => {
    setIsChecking(true);
    setCheckStep(0);
    
    // 模拟系统自动扫描的过程
    const checkItems = [
      '正在扫描影像文件清晰度...',
      '正在校验患者身份信息一致性...',
      '正在筛查病历敏感数据...',
      '正在进行逻辑互斥性分析...',
      '智能稽核通过，符合存证标准'
    ];

    let current = 0;
    const timer = setInterval(() => {
      if (current < checkItems.length) {
        setCheckStep(current);
        current++;
      } else {
        clearInterval(timer);
        setIsChecking(false);
        setIsCheckPassed(true);
        toast.success('智能合规稽核已通过，系统已自动加盖时间戳');
      }
    }, 800); // 每一个检查项耗时 0.8秒，节奏感刚好
  };

  // 2. 区块链存证过程模拟
  const handleBlockchainSubmit = async () => {
    if (!hasSignature) {
      toast.error('请先完成电子签名以授权存证');
      return;
    }
    if (!isCheckPassed) {
      toast.error('请先完成智能合规性稽核');
      return;
    }

    setIsSubmitting(true);
    
    const steps = [
      '正在提取医学影像哈希值 (SHA-256)...',
      '正在构建 Merkle Tree 存证结构...',
      '正在请求区块链节点共识记录...',
      '数据已成功写入区块 (高度: #829,102)'
    ];

    for (let i = 0; i < steps.length; i++) {
      toast.loading(steps[i], { id: 'blockchain-step' });
      await new Promise(r => setTimeout(r, 1200));
    }

    toast.success('数字化存证创建成功！', {
      id: 'blockchain-step',
      description: '证书编号：CERT-20250115008892',
      duration: 4000
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/');
    }, 2000);
  };

  // 签名画布逻辑
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 复用 Sidebar，解决割裂感 */}
      <aside className="w-[240px] bg-[#1E40AF] text-white flex flex-col fixed h-full shadow-xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg">
            <img src="/src/picture/nav.png" className="w-18 h-8" alt="Logo" />
          </div>
          <span className="text-xl font-bold tracking-tight">医点就通</span>
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {/* 这里为了视觉统一，保持与 Home 页一致的菜单 */}
          {[
            { name: '工作面板', icon: LayoutDashboard, active: true },
            { name: '患者管理', icon: Users },
            { name: '病历库', icon: FileText },
            { name: '存证中心', icon: ShieldCheck },
            { name: '数据分析', icon: TrendingUp },
          ].map((item) => (
            <div 
              key={item.name} 
              onClick={() => item.name === '工作面板' && navigate('/')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                item.active ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className={item.active ? 'text-white' : 'text-white/60'} />
              <span className={item.active ? 'font-bold' : 'text-white/80'}>{item.name}</span>
            </div>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-2 text-white/60 hover:text-red-300 transition-colors">
            <RefreshCw size={18} /> 退出工作台
          </button>
        </div>
      </aside>

      {/* 主体内容区域 */}
      <main className="flex-1 ml-[240px] p-10 pb-32">
        {/* 顶部导航与状态 */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all border border-gray-200">
              <ArrowLeft size={20} className="text-gray-500 group-hover:text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">新建数字化病历</h1>
              <p className="text-sm text-gray-400">返回工作台</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium font-mono">节点: BJ-Core-04 (延迟: 12ms)</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 gap-8 max-w-[1000px] mx-auto">
          
          {/* 1. 病历摘要卡片 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FileText size={100} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              病历内容摘要
            </h2>
            <div className="grid grid-cols-2 gap-y-6 text-sm relative z-10">
              <div className="space-y-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Patient Info</p>
                <p className="font-bold text-gray-800 text-lg">李明 <span className="text-sm font-normal text-gray-500">/ 男 / 32岁</span></p>
                <p className="text-gray-500 font-mono text-xs">ID: 110101********1234</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Attending Physician</p>
                <p className="font-bold text-gray-800 text-lg">张医生</p>
                <p className="text-gray-500 font-mono text-xs">执业编号: D20248819</p>
              </div>
              <div className="col-span-2 bg-[#F0F9FF] p-5 rounded-xl border border-blue-100 flex gap-4 items-start">
                <Activity className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-blue-900 font-bold mb-1">影像学辅助诊断修正记录</p>
                  <p className="text-blue-700/80 text-sm leading-relaxed">
                    原始诊断“中龋”已根据影像学特征（根尖周透射影）修正为“深龋”，置信度由 78% 提升至 92%。系统已自动关联相关文献库。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 核心亮点：智能合规性稽核 (录屏重点展示) */}
          <div className={`rounded-2xl border transition-all duration-500 p-8 shadow-sm ${
            isCheckPassed ? 'bg-green-50/30 border-green-200' : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-6 rounded-full ${isCheckPassed ? 'bg-green-500' : 'bg-purple-600'}`}></div>
                数字化合规性智能稽核
              </div>
              {isCheckPassed && <span className="text-green-600 flex items-center gap-1 text-sm"><CheckCircle size={16}/> 校验通过</span>}
            </h2>

            {!isChecking && !isCheckPassed ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600">
                  <ScanLine size={32} />
                </div>
                <p className="text-gray-500 mb-6 text-center max-w-md">在提交存证前，系统需要对病历数据进行完整性、合规性及影像质量的自动扫描。</p>
                <button 
                  onClick={handleSmartCheck}
                  className="px-8 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center gap-2"
                >
                  <Activity size={18} /> 开始智能校验
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 模拟进度条 */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${((checkStep + 1) / 5) * 100}%` }}
                  ></div>
                </div>
                
                {/* 检查项列表动画 */}
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {[
                    '影像文件清晰度扫描', 
                    '患者身份信息一致性校验', 
                    '病历敏感数据脱敏筛查', 
                    '诊疗逻辑互斥性分析'
                  ].map((text, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-50 bg-gray-50/50">
                      <span className={`text-sm ${index < checkStep ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                        {text}
                      </span>
                      {index < checkStep ? (
                        <CheckCircle size={18} className="text-green-500 animate-in zoom-in duration-300" />
                      ) : index === checkStep ? (
                        <Loader2 size={18} className="text-purple-500 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. 电子签名区域 (只有稽核通过才显示) */}
          <div className={`bg-white rounded-2xl border border-gray-200 p-8 shadow-sm transition-all duration-500 ${
            isCheckPassed ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale pointer-events-none'
          }`}>
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
              医生电子签名确认
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative group w-full">
                <canvas 
                  ref={canvasRef}
                  width={800} 
                  height={200} 
                  onMouseDown={() => setHasSignature(true)}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-crosshair w-full group-hover:border-blue-300 transition-colors"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400">
                    <Fingerprint size={48} className="mb-2 opacity-20" />
                    <p>请在此区域完成手写签名</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={clearSignature} className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50">
                  清除重签
                </button>
                <button onClick={() => setHasSignature(true)} className="px-6 py-2 border border-blue-500 text-blue-600 rounded-full text-sm font-bold hover:bg-blue-50">
                  使用预设签章
                </button>
              </div>
            </div>
          </div>

          {/* 4. 最终提交按钮 */}
          <div className="flex flex-col items-center gap-6 mt-4 pb-12">
            <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-xl border border-orange-100 max-w-[600px]">
              <Info size={20} className="text-orange-500 mt-1 flex-shrink-0" />
              <p className="text-xs text-orange-700 leading-relaxed">
                法律效力提示：存证后的病历将生成唯一的哈希指纹并在区块链多节点备份。点击提交即代表您对上述医疗行为的真实性负责。
              </p>
            </div>
            
            <button
              onClick={handleBlockchainSubmit}
              disabled={isSubmitting || !isCheckPassed}
              className={`w-[400px] h-[60px] rounded-full font-bold text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${
                isSubmitting || !isCheckPassed
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-[#1E40AF] text-white hover:bg-blue-800 scale-105 shadow-blue-200'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> 正在同步区块链数据...
                </>
              ) : (
                <>
                  <ShieldCheck size={24} /> 完成并提交数字存证
                </>
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}