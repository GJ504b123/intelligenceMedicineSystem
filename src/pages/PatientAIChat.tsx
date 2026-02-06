import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Bell, Brain, Image, Send, Trash2, Shield, Clock, Loader2 } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 定义消息类型
interface Message {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export default function PatientAIChat() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  
  // 1. 初始状态：只有一条欢迎语
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      content: '您好！我是您的AI健康助手。请问您哪里不舒服？您可以试着描述一下症状，比如“牙齿遇冷疼痛”。',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false); // 模拟思考状态
  const [replyStep, setReplyStep] = useState(0); // 记录对话进行到第几步
  const [countdown, setCountdown] = useState(29 * 60 + 45);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. AI 的回复剧本（按顺序触发）
  const scriptResponses = [
    "收到，我已经记录下您的初步描述。为了更准确的分析，请问疼痛的具体位置是在左侧还是右侧？是哪一颗牙齿？",
    "好的。这种疼痛是持续性的，还是只有在受到冷热刺激时才会出现？",
    "明白了。如果按1-10分给疼痛程度打分（1分微痛，10分剧痛），您觉得现在大约是几分？",
    "感谢配合。根据您的描述，初步判断可能是“牙本质敏感”或“中度龋齿”。您最近观察过牙齿表面吗，有没有明显的黑点或洞？",
    "收到反馈。建议您近期先使用脱敏牙膏，并避免直接咀嚼坚硬或极冷极热的食物。您需要我为您查询附近的门诊排班吗？",
    "正在为您调取本院口腔科的医生排班信息... 我建议您可以预约“张医生”，他是牙体牙髓科的专家，明天上午还有号。需要帮您锁定预约吗？",
    "好的，我已经为您生成了一个“诊前咨询摘要”。当您到店就医时，张医生可以直接在系统中看到我们刚才的对话记录，节省您的陈述时间。",
    "预约信息已准备就绪。请前往“我的预约”完成最后确认。还有其他我可以帮您的吗？"
  ];

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. 核心交互逻辑：发送后等待3秒回复
  const handleSendMessage = () => {
    if (!inputMessage.trim() || isTyping) return;

    // A. 添加用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    
    // B. 进入“假装思考”状态
    setIsTyping(true);

    // C. 3秒后根据剧本回复
    setTimeout(() => {
      const currentReply = scriptResponses[replyStep] || "感谢您的咨询。如果您还有其他问题，可以随时提问，或者直接拨打我们的导诊电话。";
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: currentReply,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      setReplyStep(prev => prev + 1); // 剧本推进一步
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="h-[64px] bg-gradient-to-r from-[#10B981] to-[#059669] fixed top-0 left-0 right-0 z-10 shadow-md">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Brain size={24} />
            <span className="text-2xl font-bold">智能AI诊前助手</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={logout} className="text-sm border border-white/30 px-3 py-1.5 rounded hover:bg-white/10">退出登录</button>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-medium">李</div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow pt-[64px] px-[20px] md:px-[40px] py-[32px] max-w-[900px] mx-auto w-full flex flex-col">
        {/* 顶部隐私提示 */}
        <div className="mb-6 bg-[#FEF3C7] border border-[#F59E0B] rounded-[12px] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-[#D97706] font-bold">
            <Shield size={18} /> 隐私保护模式（无痕对话）
          </div>
          <p className="text-xs text-gray-600 mb-2">本次对话已通过端到端加密，聊天记录将在页面关闭后彻底销毁。</p>
          <div className="text-sm font-mono text-[#F59E0B]">
            安全环境销毁倒计时: [{formatCountdown(countdown)}]
          </div>
        </div>
        
        {/* 对话容器 */}
        <div className="flex-1 min-h-[450px] bg-white border border-gray-200 rounded-[16px] p-6 overflow-y-auto mb-6 shadow-sm">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-6 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-[12px] shadow-sm ${
                msg.sender === 'user' ? 'bg-[#10B981] text-white rounded-tr-none' : 'bg-[#F3F4F6] text-gray-800 rounded-tl-none'
              }`}>
                <div className="text-[15px] leading-relaxed">{msg.content}</div>
                <div className={`text-[10px] mt-1 opacity-40 text-right`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* 3秒思考中的动画效果 */}
          {isTyping && (
            <div className="flex justify-start mb-6">
              <div className="bg-[#F3F4F6] text-gray-400 px-4 py-3 rounded-[12px] rounded-tl-none flex items-center gap-2 italic text-sm">
                <Loader2 size={16} className="animate-spin text-green-500" />
                AI 助手正在分析您的描述...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 交互输入框 */}
        <div className="relative">
          <div className={`flex items-center gap-2 h-[60px] bg-white border-2 rounded-full px-5 transition-all ${
            isTyping ? 'border-gray-200 opacity-60' : 'border-[#10B981] shadow-lg'
          }`}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isTyping ? "AI 正在思考中..." : "在此输入您的症状或回答信息..."}
              disabled={isTyping}
              className="flex-1 h-full outline-none text-gray-800 bg-transparent disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                inputMessage.trim() && !isTyping ? 'bg-[#10B981] text-white scale-110' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          {isTyping && (
            <div className="absolute -top-6 left-6 text-[11px] text-green-600 font-medium">
              请稍等，正在为您查询医疗知识库并生成建议...
            </div>
          )}
        </div>
        
        <button 
          onClick={() => { toast('会话已安全关闭'); navigate('/patient'); }}
          className="mt-6 text-gray-400 hover:text-red-500 text-sm flex items-center justify-center gap-1"
        >
          <Trash2 size={14} /> 结束对话并清除历史记录
        </button>
      </main>
    </div>
  );
}