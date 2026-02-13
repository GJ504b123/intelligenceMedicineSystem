import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, ShieldCheck, Activity, Database, 
  Server, ScanLine, Brain, Wifi, CheckCircle2, User, 
  FileText, AlertCircle, Loader2, Lock, EyeOff
} from 'lucide-react';
import { connectToPacs, fetchLatestDicom, invokeFederatedCleaning, DicomImage } from '@/api/deviceService';

export default function RecordCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');
  const taskSource = searchParams.get('source'); // 新增：识别来源 (task | manual)
  
  // --- 状态管理 ---
  // 工作流状态: 'idle' (初始) -> 'acquired' (已获取影像&解锁患者) -> 'cleaned' (已清洗) -> 'analyzed' (已诊断)
  const [workflowStep, setWorkflowStep] = useState<'idle' | 'acquired' | 'cleaned' | 'analyzed'>('idle');
  const [loadingState, setLoadingState] = useState(''); 
  const [currentImage, setCurrentImage] = useState<DicomImage | null>(null);
  const [aiResult, setAiResult] = useState({ anRatio: 0, hypertrophyLevel: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 完整病历表单状态
  const [recordForm, setRecordForm] = useState({
    name: '', age: '', gender: '', idCard: '',
    chiefComplaint: '', presentIllness: '', pastHistory: '无特殊病史，无药物过敏史。',
    examination: '', diagnosis: '', treatment: ''
  });
  useEffect(() => {
    if (patientIdFromUrl) {
      // 1. 加载患者信息 (无论是哪种来源，只要有ID都加载人)
      const timer = setTimeout(() => {
        if (patientIdFromUrl === 'P2026001' || patientIdFromUrl.includes('IMG')) {
          setRecordForm(prev => ({
            ...prev,
            name: '李明', age: '6岁', gender: '男', idCard: '11010120180520****'
          }));
        }
      }, 500);

      // 2. 如果是从“工作台任务”进来的 (source=task)，自动模拟“已获取影像”
      if (taskSource === 'task') {
        toast.loading('正在从 PACS 任务队列加载影像...', { duration: 1000 });
        setTimeout(() => {
          setCurrentImage({
            id: 'IMG-TASK-AUTO-01',
            patientId: 'P2026001',
            modality: 'CT',
            deviceSource: 'CT-Room-04 (Auto-Push)',
            captureTime: new Date().toISOString(),
            url: '',
            isCleaned: false
          });
          setWorkflowStep('acquired'); // 直接跳到已获取状态
          setLoadingState('');
          toast.dismiss();
          toast.success('影像任务加载完毕，请进行清洗');
        }, 1200);
      }

      return () => clearTimeout(timer);
    }
  }, [patientIdFromUrl, taskSource]);
  // --- Step 1: 获取影像 (同时触发患者信息加载) ---
  const handleAcquireImage = async () => {
    setLoadingState('connecting');
    toast.info('正在握手 PACS 影像系统协议...');
    
    try {
      // 1. 模拟连接硬件
      await connectToPacs('CT-04');
      setLoadingState('transferring');
      
      // 2. 模拟拉取影像 (真实的 DICOM 会包含 PatientID)
      const image = await fetchLatestDicom();
      setCurrentImage(image);
      
      // 3. 核心改进：影像拉取成功后，自动根据影像元数据“解码”出患者信息
      setRecordForm(prev => ({
        ...prev,
        name: '李明',
        age: '6岁',
        gender: '男',
        idCard: '11010120180520****'
      }));

      setWorkflowStep('acquired'); // 此时才解锁左侧界面
      toast.success('影像采集成功', { description: '已根据 DICOM 元数据自动关联患者档案' });
    } catch (e) {
      toast.error('设备通信异常，请检查接口设置');
    } finally {
      setLoadingState('');
    }
  };

  // --- Step 2: 联邦清洗 ---
  const handleCleanData = async () => {
    if (!currentImage) return;
    setLoadingState('cleaning');
    const cleaningSteps = ['正在连接联邦节点...', '执行同态加密脱敏...', '回传脱敏后影像...'];
    for (const step of cleaningSteps) {
      toast.loading(step, { duration: 800 });
      await new Promise(r => setTimeout(r, 800));
    }
    const cleaned = await invokeFederatedCleaning(currentImage.id);
    setCurrentImage(cleaned);
    setWorkflowStep('cleaned');
    toast.dismiss();
    toast.success('数据清洗完成');
    setLoadingState('');
  };

  // --- Step 3: AI 辅助诊断 ---
  const handleAiDiagnose = () => {
    setLoadingState('analyzing');
    setTimeout(() => {
      const result = {
        anRatio: 0.72,
        hypertrophyLevel: 'III 度肥大',
        description: '经 Transformer 模型推理：鼻咽腔气道显著受压，腺样体厚度超过临界值。'
      };
      setAiResult(result);
      setWorkflowStep('analyzed');
      setLoadingState('');
      setRecordForm(prev => ({
        ...prev,
        examination: `【影像学所见】\n${result.description}\n\nA/N 比率: ${result.anRatio}`,
        diagnosis: '腺样体肥大',
        treatment: '建议行手术切除。'
      }));
      toast.success('诊断报告已生成');
    }, 2000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success('病历存证成功');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      {/* 顶部栏 */}
      <header className="h-14 bg-white border-b px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-800 text-lg">新建数字化病历</h1>
        </div>
        <div className="flex gap-2 text-xs">
           <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 font-bold">
             <Wifi size={12} /> PACS 网络正常
           </span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* 左侧：病历录入区 (只有获取影像后才完全亮起) */}
        <div className="w-[55%] overflow-y-auto p-8 border-r border-gray-200 bg-white shadow-inner relative">
          
          {/* 核心改动：未采集影像时的遮罩 */}
          {workflowStep === 'idle' && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center max-w-sm text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <EyeOff size={32} />
                </div>
                <h3 className="text-gray-800 font-bold text-lg mb-2">等待影像接入</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  为了保障医疗安全与隐私，请先在右侧控制台<span className="text-blue-600 font-bold">连接设备并读取影像数据</span>。系统将根据影像自动同步患者档案。
                </p>
              </div>
            </div>
          )}

          <div className="max-w-2xl mx-auto space-y-8">
            {/* 患者基本档案 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-700">
              <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-500" /> 患者基本档案
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">姓名</p>
                  <p className="font-bold text-slate-800 text-lg">{recordForm.name || '---'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">性别/年龄</p>
                  <p className="font-medium text-slate-700">{recordForm.gender} / {recordForm.age}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">就诊流水号</p>
                  <p className="font-mono text-blue-600 text-xs font-bold">{patientIdFromUrl || '自动生成中'}</p>
                </div>
              </div>
            </div>

            {/* 病历详情录入区 */}
            <section className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <FileText size={16} className="text-blue-500" /> 主诉 (Chief Complaint)
                </label>
                <textarea 
                  value={recordForm.chiefComplaint}
                  onChange={e => setRecordForm({...recordForm, chiefComplaint: e.target.value})}
                  className="w-full h-20 border border-gray-300 rounded-xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                  placeholder="请输入病人自述症状..."
                />
              </div>

              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Brain size={16} className="text-purple-500" /> 专科检查 (AI 分析回填区)
                </label>
                <textarea 
                  value={recordForm.examination}
                  readOnly
                  className={`w-full h-32 border rounded-xl p-4 text-sm transition-all resize-none bg-slate-50 text-slate-600`}
                  placeholder="执行 AI 诊断后，影像特征将自动填入此处..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 block mb-2">最终确诊建议</label>
                <input 
                  type="text"
                  value={recordForm.diagnosis}
                  onChange={e => setRecordForm({...recordForm, diagnosis: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-bold shadow-sm"
                  placeholder="请核对 AI 结果后填写最终结论..."
                />
              </div>
            </section>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button 
                onClick={handleSubmit}
                disabled={workflowStep !== 'analyzed' || isSubmitting}
                className="px-10 py-3 bg-[#1E40AF] text-white rounded-full hover:bg-blue-800 shadow-xl text-sm font-bold flex items-center gap-2 disabled:bg-gray-200 transition-all"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                签名并提交存证
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：智能诊断控制台 (45%) */}
        <div className="w-[45%] bg-slate-50 p-8 flex flex-col gap-6 overflow-y-auto">
          <div className="mb-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
              <Activity className="text-blue-600" size={24} /> Workflow Console
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest">
              请按顺序执行：采集 &gt; 清洗 &gt; 诊断
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1: 影像采集 (这一步是解锁患者的关键) */}
            <div className={`p-6 rounded-2xl border bg-white transition-all duration-500 ${
              workflowStep === 'idle' ? 'border-blue-500 shadow-xl ring-4 ring-blue-500/5 scale-[1.02]' : 'border-slate-200 opacity-60'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                {workflowStep !== 'idle' && <CheckCircle2 className="text-green-500" size={20} />}
              </div>
              <h3 className="font-bold text-slate-800 mb-2">影像数据源接入 (PACS)</h3>
              <div className="bg-slate-900 rounded-xl h-44 flex items-center justify-center relative overflow-hidden">
                {currentImage ? (
                  <div className="text-center animate-in zoom-in duration-500">
                    <ScanLine size={40} className="mx-auto text-blue-400 mb-2 opacity-40" />
                    <p className="text-[10px] text-blue-300 font-mono">FILE_ID: {currentImage.id}</p>
                    <p className="text-[10px] text-slate-500">DICOM 序列已挂载至当前会话</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Server size={24} className="mx-auto text-slate-700 mb-2" />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Awaiting Device Connection</p>
                  </div>
                )}
                {loadingState === 'transferring' && (
                  <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-blue-400">
                    <Activity className="animate-spin mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Streaming Dicom Data...</span>
                  </div>
                )}
              </div>
              {workflowStep === 'idle' && (
                <button 
                  onClick={handleAcquireImage} 
                  disabled={!!loadingState}
                  className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Wifi size={14} /> 建立物理连接并读取
                </button>
              )}
            </div>

            {/* Step 2: 联邦清洗 (已简化展示) */}
            <div className={`p-6 rounded-2xl border bg-white transition-all duration-500 ${
              workflowStep === 'acquired' ? 'border-purple-500 shadow-xl ring-4 ring-purple-500/5' : 'border-slate-200 opacity-60'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                {(workflowStep === 'cleaned' || workflowStep === 'analyzed') && <CheckCircle2 className="text-green-500" size={20} />}
              </div>
              <h3 className="font-bold text-slate-800 mb-1">联邦学习隐私处理</h3>
              <p className="text-[10px] text-slate-400 mb-4 tracking-tighter">同态加密 (HE) &gt; 差分隐私 (DP) &gt; 标准化</p>

              {workflowStep === 'acquired' && (
                <button 
                  onClick={handleCleanData} 
                  disabled={!!loadingState}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100"
                >
                  <Lock size={14} /> 启动联邦节点脱敏
                </button>
              )}
            </div>

            {/* Step 3: AI 诊断 */}
            <div className={`p-6 rounded-2xl border bg-white transition-all duration-500 ${
              workflowStep === 'cleaned' ? 'border-emerald-500 shadow-xl ring-4 ring-emerald-500/5' : 'border-slate-200 opacity-60'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                {workflowStep === 'analyzed' && <CheckCircle2 className="text-green-500" size={20} />}
              </div>
              <h3 className="font-bold text-slate-800 mb-4 tracking-tight">腺样体多模态 AI 推理</h3>

              {workflowStep === 'analyzed' ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">A/N Ratio</p>
                      <p className="text-2xl font-black text-emerald-600">{aiResult.anRatio}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                      <p className="text-[9px] text-red-400 font-bold uppercase mb-1">Severity</p>
                      <p className="text-sm font-black text-red-600 uppercase">{aiResult.hypertrophyLevel}</p>
                    </div>
                  </div>
                </div>
              ) : workflowStep === 'cleaned' && (
                <button 
                  onClick={handleAiDiagnose} 
                  disabled={!!loadingState}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Brain size={14} /> 运行 Transformer 推理
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}