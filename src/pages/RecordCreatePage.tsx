import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, ShieldCheck, Activity, 
  Server, ScanLine, Brain, Wifi, CheckCircle2, User,
  FileText,  Loader2, Lock, 
  Image, X, ChevronLeft, ChevronRight, AlertTriangle, Stethoscope,
  Link2, FileSearch, Info, Wand2
} from 'lucide-react';
import { connectToPacs, fetchLatestDicom} from '@/api/deviceService';

const SAMPLE_IMAGES = [
  { id: '1', src: '/患者拍摄无处理图.jpg', label: 'CT扫描原图', type: 'pacs' as const },
  { id: '2', src: '/患者拍摄后人工标注提示ai学习的区域图.png', label: 'CT扫描人工标注', type: 'pacs' as const },
  { id: '3', src: '/AI分割的图1.png', label: 'AI分割视图1', type: 'pacs' as const },
  { id: '4', src: '/AI分割的图2.png', label: 'AI分割视图2', type: 'pacs' as const },
  { id: '5', src: '/ai分割的图3.png', label: 'AI分割视图3', type: 'pacs' as const },
];

const REQUIRED_FIELDS = [
  { key: 'chiefComplaint', label: '主诉' },
  { key: 'presentIllness', label: '现病史' },
  { key: 'examination', label: '专科检查' },
  { key: 'diagnosis', label: '诊断' },
  { key: 'treatment', label: '处理意见' },
  { key: 'doctorSignature', label: '医师签名' },
];

interface Patient {
  id: string;
  name: string;
  age: string;
  gender: string;
  idCard: string;
  phone?: string;
}

interface OperationLog {
  id: string;
  action: string;
  operatorId: string;
  operatorName: string;
  timestamp: string;
  patientId: string;
  details: string;
}

export default function RecordCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');
  const taskSource = searchParams.get('source');

  const isManualMode = taskSource === 'manual';

  const [workflowStep, setWorkflowStep] = useState<'idle' | 'patient-select' | 'acquired' | 'cleaned' | 'analyzed' | 'confirmed' | 'submitted'>('idle');
  const [loadingState, setLoadingState] = useState('');
  const [currentImages, setCurrentImages] = useState<typeof SAMPLE_IMAGES>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [aiResult, setAiResult] = useState({ anRatio: 0, hypertrophyLevel: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [uploadPreviewImages, setUploadPreviewImages] = useState<{ id: string; src: string; label: string; type: 'clinical' | 'pacs' }[]>([]);
  const [uploadIndex, setUploadIndex] = useState(0);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPacsSelector, setShowPacsSelector] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const signCanvasRef = useRef<HTMLCanvasElement>(null);
  const signContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [pacsImages, setPacsImages] = useState<typeof SAMPLE_IMAGES>([]);

  const [recordForm, setRecordForm] = useState({
    name: '', age: '', gender: '', idCard: '',
    pacsPatientId: '',
    chiefComplaint: '',
    presentIllness: '',
    pastHistory: '无特殊病史，无药物过敏史。',
    examination: '',
    diagnosis: '',
    treatment: '',
    doctorSignature: ''
  });

  const logOperation = (action: string, details: string) => {
    const log: OperationLog = {
      id: `log_${Date.now()}`,
      action,
      operatorId: 'DOCTOR_001',
      operatorName: '当前医生',
      timestamp: new Date().toISOString(),
      patientId: selectedPatient?.id || recordForm.pacsPatientId || 'unknown',
      details
    };
    setOperationLogs(prev => [...prev, log]);
    console.log('[操作日志]', log);
  };

  const startSign = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (workflowStep === 'submitted') return;
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsSigning(true);
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }, [workflowStep]);

  const drawSign = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSigning || workflowStep === 'submitted') return;
    
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }, [isSigning, workflowStep]);

  const endSign = useCallback(() => {
    if (!isSigning) return;
    setIsSigning(false);
    
    const canvas = signCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setRecordForm(prev => ({ ...prev, doctorSignature: dataUrl }));
      logOperation('DOCTOR_SIGNED', '医师完成电子签名');
    }
  }, [isSigning]);

  const clearSign = useCallback(() => {
    const canvas = signCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setRecordForm(prev => ({ ...prev, doctorSignature: '' }));
        logOperation('SIGNATURE_CLEARED', '清除医师签名');
      }
    }
  }, []);

  const quickSign = useCallback(() => {
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(20, canvas.height / 2);
    ctx.lineTo(canvas.width - 20, canvas.height / 2);
    ctx.stroke();
    
    const dataUrl = canvas.toDataURL('image/png');
    setRecordForm(prev => ({ ...prev, doctorSignature: dataUrl }));
    logOperation('DOCTOR_SIGNED', '医师完成电子签名');
  }, []);

  useEffect(() => {
    if (patientIdFromUrl && taskSource === 'task') {
      toast.loading('正在从 PACS 任务队列加载影像...', { duration: 1000 });
      setTimeout(() => {
        setCurrentImages(SAMPLE_IMAGES.map(img => ({ ...img, type: 'pacs' as const })));
        setRecordForm(prev => ({
          ...prev,
          name: '李明',
          age: '6岁',
          gender: '男',
          idCard: '11010120180520****',
          pacsPatientId: 'P2026001'
        }));
        setWorkflowStep('acquired');
        logOperation('PACS_IMAGE_RECEIVED', `接收PACS影像${SAMPLE_IMAGES.length}张，患者ID:P2026001`);
        toast.dismiss();
        toast.success('影像任务加载完毕，请进行清洗');
      }, 1200);
    } else if (taskSource === 'manual') {
      setWorkflowStep('patient-select');
    }
  }, [patientIdFromUrl, taskSource]);

  const validateRequiredFields = () => {
    const missing = REQUIRED_FIELDS
      .filter(f => !recordForm[f.key as keyof typeof recordForm]?.trim())
      .map(f => f.label);
    return missing;
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setRecordForm(prev => ({
      ...prev,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      idCard: patient.idCard,
      pacsPatientId: patient.id
    }));
    setWorkflowStep('acquired');
    logOperation('PATIENT_SELECTED', `选择患者档案:${patient.name}(${patient.id})`);

    setPacsImages(SAMPLE_IMAGES.map(img => ({ ...img, type: 'pacs' as const })));
    toast.success(`已关联患者：${patient.name}`);
  };

  const handleAcquireImage = async () => {
    setLoadingState('connecting');
    toast.info('正在握手 PACS 影像系统协议...');

    try {
      await connectToPacs('CT-04');
      setLoadingState('transferring');

      const image = await fetchLatestDicom();

      if (!image.patientId || !image.patientName) {
        toast.error('PACS影像缺少患者身份信息，拒绝创建病历');
        logOperation('PACS_VALIDATION_FAILED', 'PACS影像缺少患者身份信息');
        setLoadingState('');
        return;
      }

      setCurrentImages(SAMPLE_IMAGES.map(img => ({ ...img, type: 'pacs' as const })));

      setRecordForm(prev => ({
        ...prev,
        name: image.patientName,
        age: '根据生日计算',
        gender: image.patientGender || '男',
        idCard: '****',
        pacsPatientId: image.patientId
      }));

      setWorkflowStep('acquired');
      logOperation('PACS_IMAGE_ACQUIRED', `获取PACS影像，患者ID:${image.patientId}`);
      toast.success('影像采集成功，患者身份已自动匹配');
    } catch (e) {
      toast.error('设备通信异常，请检查接口设置');
      logOperation('PACS_ERROR', 'PACS连接失败');
    } finally {
      setLoadingState('');
    }
  };

  const handleLinkPacsImages = () => {
    setShowPacsSelector(true);
    setPacsImages(SAMPLE_IMAGES.map(img => ({ ...img, type: 'pacs' as const })));
    logOperation('PACS_SELECTOR_OPENED', '打开PACS影像选择器');
  };

  const handleSelectPacsImage = (img: typeof SAMPLE_IMAGES[0]) => {
    if (!uploadPreviewImages.find(i => i.id === img.id)) {
      setUploadPreviewImages(prev => [...prev, { ...img, type: 'pacs' as const }]);
      logOperation('PACS_IMAGE_LINKED', `关联PACS影像:${img.label}`);
    }
    setShowPacsSelector(false);
    toast.success('已关联PACS影像');
  };

  const handleCleanData = async () => {
    if (currentImages.length === 0 && uploadPreviewImages.filter(i => i.type === 'pacs').length === 0) {
      toast.error('请先获取影像');
      return;
    }
    setLoadingState('cleaning');
    const cleaningSteps = ['正在连接联邦节点...', '执行同态加密脱敏...', '回传脱敏后影像...'];
    for (const step of cleaningSteps) {
      toast.loading(step, { duration: 800 });
      await new Promise(r => setTimeout(r, 800));
    }
    logOperation('DATA_CLEANED', '联邦学习隐私处理完成');
    setWorkflowStep('cleaned');
    toast.dismiss();
    toast.success('数据清洗完成');
    setLoadingState('');
  };

  const handleAiDiagnose = () => {
    setLoadingState('analyzing');
    logOperation('AI_ANALYSIS_START', '启动AI诊断分析');
    setTimeout(() => {
      const result = {
        anRatio: 0.72,
        hypertrophyLevel: 'III 度肥大',
        description: '经 Transformer 模型推理：鼻咽腔气道显著受压，腺样体厚度超过临界值。建议行手术切除治疗，A/N比率达0.72，符合重度肥大标准。'
      };
      setAiResult(result);
      setWorkflowStep('analyzed');
      setLoadingState('');
      setIsAiGenerated(true);
      setRecordForm(prev => ({
        ...prev,
        examination: `【影像学所见】\n${result.description}\n\nA/N 比率: ${result.anRatio}`,
        diagnosis: `腺样体肥大（${result.hypertrophyLevel}）`
      }));
      logOperation('AI_ANALYSIS_COMPLETE', `AI诊断完成，A/N比率:${result.anRatio}`);
      toast.success('AI诊断报告已生成，可编辑确认');
    }, 2000);
  };

  const handleConfirmDiagnosis = () => {
    setWorkflowStep('confirmed');
    logOperation('DIAGNOSIS_CONFIRMED', `医生确认诊断:${recordForm.diagnosis}`);
    toast.success('诊断已确认，医生已承担责任');
  };

  // 一键填充演示数据（方便演示使用）
  const handleAutoFillDemo = () => {
    setRecordForm({
      ...recordForm,
      chiefComplaint: '反复鼻塞、流涕1年余，加重伴打鼾3个月',
      presentIllness: '患者1年前无明显诱因出现鼻塞、流涕，呈间歇性，遇冷空气或感冒后加重。3个月前症状加重，出现夜间打鼾，偶有憋醒，影响睡眠质量。无头痛、鼻出血、嗅觉减退等症状。',
      examination: '【影像学所见】\n鼻咽部CT平扫示：腺样体组织增厚，占据后鼻孔约75%，气道受压变窄。双侧咽鼓管咽口受压。\n\nA/N 比率: 0.75',
      diagnosis: '腺样体肥大（中度）',
      treatment: '1. 建议手术治疗：腺样体切除术\n2. 术前完善相关检查\n3. 术后注意事项：避免剧烈运动，预防感染',
      doctorSignature: ''
    });
    
    // 自动签名
    handleQuickSign();
    
    logOperation('DEMO_DATA_FILLED', '一键填充演示数据');
    toast.success('演示数据已填充完成');
  };

  const handleSubmit = async () => {
    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      toast.error(`请填写以下必填项：${missingFields.join('、')}`);
      return;
    }

    if (!isManualMode && currentImages.length === 0) {
      toast.error('PACS影像未获取，无法归档');
      return;
    }

    if (isManualMode && !selectedPatient) {
      toast.error('必须关联患者档案，禁止创建匿名病历');
      return;
    }

    logOperation('RECORD_SUBMIT_ATTEMPT', `提交病历，患者:${recordForm.name}`);

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    logOperation('RECORD_SUBMITTED', `病历存证完成，绑定PACS影像:${currentImages.length}张，参考附件:${uploadPreviewImages.filter(i => i.type === 'clinical').length}张`);
    toast.success('病历存证成功');
    setWorkflowStep('submitted');
    setIsSubmitting(false);
  };

  const handleUploadDemo = () => {
    const clinicalImages = SAMPLE_IMAGES.slice(0, 2).map(img => ({
      id: `clinical_${img.id}`,
      src: img.src,
      label: img.label,
      type: 'clinical' as const
    }));
    setUploadPreviewImages(prev => [...prev, ...clinicalImages]);
    logOperation('CLINICAL_PHOTO_UPLOADED', `上传临床照片${clinicalImages.length}张`);
    toast.success('已加载临床照片（仅作参考）');
  };

  const handleRemoveUploadedImage = (index: number) => {
    const removed = uploadPreviewImages[index];
    logOperation('ATTACHMENT_REMOVED', `删除附件:${removed.label}`);
    setUploadPreviewImages(prev => prev.filter((_, i) => i !== index));
    if (uploadIndex >= index && uploadIndex > 0) {
      setUploadIndex(prev => prev - 1);
    }
  };

  const nextImage = (images: any[], currentIdx: number, setIdx: (i: number) => void) => {
    if (images.length <= 1) return;
    setIdx(currentIdx === images.length - 1 ? 0 : currentIdx + 1);
  };

  const prevImage = (images: any[], currentIdx: number, setIdx: (i: number) => void) => {
    if (images.length <= 1) return;
    setIdx(currentIdx === 0 ? images.length - 1 : currentIdx - 1);
  };

  const displayImages = isManualMode ? uploadPreviewImages : currentImages;

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      <header className="h-14 bg-white border-b px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-gray-800 text-lg">
            {isManualMode ? '手动新建病历' : 'PACS推送病历'}
          </h1>
          {isManualMode && (
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
              灵活创建
            </span>
          )}
          {!isManualMode && (
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
              影像驱动
            </span>
          )}
          {workflowStep === 'submitted' && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
              已归档
            </span>
          )}
        </div>
        <div className="flex gap-2 text-xs">
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full border font-bold ${
            isManualMode 
              ? 'text-blue-600 bg-blue-50 border-blue-100' 
              : 'text-green-600 bg-green-50 border-green-100'
          }`}>
            <Wifi size={12} /> {isManualMode ? 'PACS可选' : 'PACS已连接'}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-[55%] overflow-y-auto p-8 border-r border-gray-200 bg-white">
          {workflowStep === 'patient-select' && (
            <div className="h-full flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center max-w-md text-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-gray-800 font-bold text-lg mb-2">必须关联患者档案</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  手动新建病历禁止创建匿名病历，请搜索并选择患者档案
                </p>
                <input
                  type="text"
                  placeholder="输入患者姓名或ID搜索..."
                  value={patientSearchQuery}
                  onChange={e => setPatientSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm mb-4"
                />
                <div className="w-full space-y-2 max-h-48 overflow-y-auto">
                  {patientSearchQuery && (
                    <button
                      onClick={() => handlePatientSelect({ id: 'P2026001', name: '李明', age: '6岁', gender: '男', idCard: '11010120180520****' })}
                      className="w-full p-3 border border-gray-200 rounded-xl text-left hover:bg-blue-50 transition-all"
                    >
                      <p className="font-bold text-gray-800">李明</p>
                      <p className="text-xs text-gray-500">ID: P2026001 | 男 6岁</p>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {workflowStep === 'idle' && (
            <div className="h-full flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center max-w-sm text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isManualMode ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                }`}>
                  {isManualMode ? <Server size={32} /> : <ScanLine size={32} />}
                </div>
                <h3 className="text-gray-800 font-bold text-lg mb-2">
                  {isManualMode ? '准备手动创建' : '等待PACS推送'}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {isManualMode
                    ? '手动模式：选择患者档案后即可创建纯文字病历，也可选择性关联PACS影像进行AI分析。'
                    : 'PACS模式：必须等待设备推送影像，系统将自动匹配患者信息。'}
                </p>
              </div>
            </div>
          )}

          {(workflowStep !== 'idle' && workflowStep !== 'patient-select') && (
            <div className="max-w-2xl mx-auto space-y-8">
              {/* 一键填充演示数据按钮 */}
              <div className="flex justify-end">
                <button
                  onClick={handleAutoFillDemo}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-bold hover:bg-amber-200 transition-all flex items-center gap-2"
                >
                  <Wand2 size={16} />
                  一键填充演示数据
                </button>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
                  <User size={18} className="text-blue-500" /> 患者基本档案
                  {isManualMode && selectedPatient && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-normal">
                      已关联实名档案
                    </span>
                  )}
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
                    <p className="font-mono text-blue-600 text-xs font-bold">{selectedPatient?.id || recordForm.pacsPatientId || '自动生成中'}</p>
                  </div>
                </div>
              </div>

              <section className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <FileText size={16} className="text-blue-500" />
                    主诉 (Chief Complaint)
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={recordForm.chiefComplaint}
                    onChange={e => setRecordForm({...recordForm, chiefComplaint: e.target.value})}
                    className="w-full h-20 border border-gray-300 rounded-xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                    placeholder="请输入病人自述症状..."
                    disabled={workflowStep === 'submitted'}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <FileText size={16} className="text-blue-500" />
                    现病史 (Present Illness)
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={recordForm.presentIllness}
                    onChange={e => setRecordForm({...recordForm, presentIllness: e.target.value})}
                    className="w-full h-20 border border-gray-300 rounded-xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                    placeholder="请输入现病史..."
                    disabled={workflowStep === 'submitted'}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Brain size={16} className="text-purple-500" />
                    专科检查 (Examination)
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={recordForm.examination}
                    onChange={e => { setRecordForm({...recordForm, examination: e.target.value}); setIsAiGenerated(false); }}
                    className="w-full h-32 border rounded-xl p-4 text-sm transition-all resize-none bg-slate-50 text-slate-600"
                    placeholder="执行 AI 诊断后，影像特征将自动填入此处..."
                    disabled={workflowStep === 'submitted'}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Stethoscope size={16} className="text-emerald-500" />
                    诊断结论 (Diagnosis)
                    <span className="text-red-500">*</span>
                    {isAiGenerated && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-normal">
                        AI生成
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recordForm.diagnosis}
                      onChange={e => { setRecordForm({...recordForm, diagnosis: e.target.value}); setIsAiGenerated(false); }}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-bold shadow-sm"
                      placeholder="请核对 AI 结果后填写最终结论..."
                      disabled={workflowStep === 'submitted'}
                    />
                    {isAiGenerated && workflowStep === 'analyzed' && (
                      <button
                        onClick={handleConfirmDiagnosis}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1"
                      >
                        <ShieldCheck size={14} /> 确认诊断
                      </button>
                    )}
                  </div>
                  {workflowStep === 'confirmed' && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 size={12} /> 医生已确认诊断内容，承担相应责任
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Activity size={16} className="text-rose-500" />
                    处理意见 (Treatment)
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={recordForm.treatment}
                    onChange={e => setRecordForm({...recordForm, treatment: e.target.value})}
                    className="w-full h-20 border border-gray-300 rounded-xl p-4 text-sm transition-all resize-none"
                    placeholder="请输入处理意见..."
                    disabled={workflowStep === 'submitted'}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <ShieldCheck size={16} className="text-blue-500" />
                    医师签名 (Doctor Signature)
                    <span className="text-red-500">*</span>
                    {recordForm.doctorSignature && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-normal">
                        已签名
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <canvas 
                      ref={signCanvasRef} 
                      width={300}
                      height={120}
                      className="w-full h-32 cursor-crosshair"
                      onMouseDown={startSign}
                      onMouseMove={drawSign}
                      onMouseUp={endSign}
                      onMouseLeave={endSign}
                    />
                    <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
                      <button
                        onClick={quickSign}
                        disabled={workflowStep === 'submitted'}
                        className="px-4 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        快捷签名
                      </button>
                      <button
                        onClick={clearSign}
                        disabled={!recordForm.doctorSignature || workflowStep === 'submitted'}
                        className="px-4 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        清除重签
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    请在上方区域手写签名（支持鼠标/触屏）
                  </p>
                </div>

                {workflowStep === 'cleaned' && (
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                      <Brain size={16} className="text-emerald-600" />
                      影像已清洗脱敏，可以进行 AI 诊断分析
                    </p>
                    <button
                      onClick={handleAiDiagnose}
                      disabled={!!loadingState}
                      className="mt-3 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                    >
                      {loadingState === 'analyzing' ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Brain size={18} />
                      )}
                      {loadingState === 'analyzing' ? 'AI 正在分析中...' : '启动 AI 诊断分析'}
                    </button>
                  </div>
                )}

                {workflowStep === 'submitted' && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <p className="text-emerald-700 font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      病历已归档完成
                    </p>
                    <p className="text-xs text-emerald-600 mt-2">
                      操作日志已记录 {operationLogs.length} 条
                    </p>
                  </div>
                )}
              </section>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    (isManualMode ? (workflowStep !== 'acquired') : (workflowStep !== 'analyzed' && workflowStep !== 'confirmed')) ||
                    isSubmitting ||
                    workflowStep === 'submitted'
                  }
                  className="px-10 py-3 bg-[#1E40AF] text-white rounded-full hover:bg-blue-800 shadow-xl text-sm font-bold flex items-center gap-2 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  签名并提交存证
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-[45%] bg-slate-50 p-8 flex flex-col overflow-y-auto">
          <div className="mb-4">
            <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 uppercase ${
              isManualMode ? 'text-blue-800' : 'text-purple-800'
            }`}>
              <Image className={isManualMode ? 'text-blue-600' : 'text-purple-600'} size={24} /> 
              {isManualMode ? '关联影像区' : 'PACS影像区'}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest">
              {isManualMode 
                ? '可选择关联PACS影像进行AI分析' 
                : 'PACS设备自动推送的原始影像'}
            </p>
          </div>

          {isManualMode ? (
            <div className="flex-1 flex flex-col">
              {workflowStep !== 'patient-select' && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleLinkPacsImages}
                    disabled={workflowStep === 'cleaned' || workflowStep === 'analyzed' || workflowStep === 'confirmed'}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Link2 size={14} /> 关联PACS影像
                  </button>
                  {uploadPreviewImages.filter(i => i.type === 'pacs').length > 0 && workflowStep === 'acquired' && (
                    <button
                      onClick={handleCleanData}
                      disabled={!!loadingState}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock size={14} /> 数据清洗
                    </button>
                  )}
                  {workflowStep === 'cleaned' && (
                    <button
                      onClick={handleAiDiagnose}
                      disabled={!!loadingState}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Brain size={14} /> AI诊断
                    </button>
                  )}
                </div>
              )}

              <div
                className={`flex-1 border-2 border-dashed rounded-2xl bg-white transition-all flex flex-col items-center justify-center min-h-[300px] ${
                  uploadPreviewImages.length > 0 ? 'border-gray-200' : 'border-gray-300'
                }`}
              >
                {uploadPreviewImages.length > 0 ? (
                  <div className="w-full h-full p-4 flex flex-col">
                    <div className="relative flex-1 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden">
                      <img
                        src={uploadPreviewImages[uploadIndex]?.src}
                        alt={`影像 ${uploadIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                        uploadPreviewImages[uploadIndex]?.type === 'pacs'
                          ? 'bg-purple-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {uploadPreviewImages[uploadIndex]?.type === 'pacs' ? 'PACS原始影像' : '临床参考'}
                      </div>
                      {uploadPreviewImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); prevImage(uploadPreviewImages, uploadIndex, setUploadIndex); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nextImage(uploadPreviewImages, uploadIndex, setUploadIndex); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                      {workflowStep !== 'submitted' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveUploadedImage(uploadIndex); }}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-500"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-center gap-2 mt-3">
                      {uploadPreviewImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setUploadIndex(idx); }}
                          className={`w-2 h-2 rounded-full transition-all ${idx === uploadIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-2">
                      第 {uploadIndex + 1} / {uploadPreviewImages.length} 张
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileSearch size={36} />
                    </div>
                    <p className="text-gray-600 font-bold text-lg mb-2">暂无关联影像</p>
                    <p className="text-gray-400 text-sm">点击上方「关联PACS影像」按钮<br/>从院内系统选择患者影像</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-700 text-xs font-bold flex items-center gap-1">
                        <Info size={12} /> 提示
                      </p>
                      <ul className="text-blue-600 text-xs mt-1 space-y-1">
                        <li>• 手动病历可不带影像提交</li>
                        <li>• 涉及放射诊断须关联PACS原始影像</li>
                        <li>• 影像仅从院内PACS系统关联，禁止本地上传</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                {isManualMode ? '归档后附件仅可查看，禁止删除' : 'PACS原始影像归档后禁止删除、替换、修改'}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                <div className="relative h-full flex flex-col">
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
                      CT 扫描
                    </span>
                    {workflowStep === 'cleaned' && (
                      <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
                        已脱敏
                      </span>
                    )}
                    {currentImages.length > 0 && (
                      <span className="bg-slate-800/80 text-white text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                        <Lock size={10} /> 仅可查看
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center bg-slate-900 relative overflow-hidden">
                    {displayImages.length > 0 ? (
                      <>
                        <img
                          src={displayImages[currentImageIndex]?.src}
                          alt={`CT扫描 ${currentImageIndex + 1}`}
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                          {displayImages[currentImageIndex]?.label || `切片 ${currentImageIndex + 1}`}
                        </div>
                        {displayImages.length > 1 && workflowStep !== 'submitted' && (
                          <>
                            <button
                              onClick={() => prevImage(displayImages, currentImageIndex, setCurrentImageIndex)}
                              className="absolute left-2 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-all text-white"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={() => nextImage(displayImages, currentImageIndex, setCurrentImageIndex)}
                              className="absolute right-2 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-all text-white"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-slate-500">
                        <Server size={48} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">等待影像加载...</p>
                      </div>
                    )}
                  </div>

                  {displayImages.length > 1 && (
                    <div className="p-3 bg-slate-50 border-t border-gray-100">
                      <div className="flex justify-center gap-1.5">
                        {displayImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                              idx === currentImageIndex
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      <p className="text-center text-xs text-gray-400 mt-2">
                        第 {currentImageIndex + 1} / {displayImages.length} 张切片
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {workflowStep === 'idle' && (
                  <button
                    onClick={handleAcquireImage}
                    disabled={!!loadingState}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    <Wifi size={14} /> {loadingState === 'connecting' ? '连接中...' : '建立物理连接并读取'}
                  </button>
                )}
                {workflowStep === 'acquired' && (
                  <button
                    onClick={handleCleanData}
                    disabled={!!loadingState}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100"
                  >
                    <Lock size={14} /> {loadingState === 'cleaning' ? '清洗中...' : '启动联邦节点脱敏'}
                  </button>
                )}
                {workflowStep === 'cleaned' && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                    <p className="text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 size={14} /> 影像已清洗脱敏，可进行诊断
                    </p>
                  </div>
                )}
                {workflowStep === 'analyzed' && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-blue-700 text-xs font-bold mb-2 flex items-center gap-2">
                      <Brain size={14} /> AI 诊断结果
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase">A/N 比率</p>
                        <p className="text-lg font-black text-emerald-600">{aiResult.anRatio}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase">肥大程度</p>
                        <p className="text-sm font-black text-red-600">{aiResult.hypertrophyLevel}</p>
                      </div>
                    </div>
                  </div>
                )}
                {workflowStep === 'confirmed' && (
                  <div className="p-3 bg-emerald-100 rounded-xl border border-emerald-200 text-center">
                    <p className="text-emerald-700 text-xs font-bold flex items-center justify-center gap-2">
                      <ShieldCheck size={14} /> 诊断已确认，请完成病历提交
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {showPacsSelector && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">选择PACS影像</h3>
                  <button onClick={() => setShowPacsSelector(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">选择要关联到当前病历的PACS原始影像</p>
                <div className="grid grid-cols-3 gap-3">
                  {pacsImages.map(img => (
                    <div
                      key={img.id}
                      className="border border-gray-200 rounded-xl p-2 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                      onClick={() => handleSelectPacsImage(img)}
                    >
                      <div className="aspect-square bg-slate-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        <img src={img.src} alt={img.label} className="max-w-full max-h-full object-contain" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">{img.label}</p>
                      <p className="text-xs text-gray-400">PACS原始影像</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}