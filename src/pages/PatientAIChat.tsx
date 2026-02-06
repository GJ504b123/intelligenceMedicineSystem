import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Bell, Brain, Image, Send, Trash2, Shield, Info, Clock } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 定义消息类型
interface Message {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

// 定义快速问题类型
interface QuickQuestion {
  id: string;
  text: string;
}

export default function PatientAIChat() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是您的AI健康助手。请描述您的症状，我会为您提供初步分析和建议。',
      sender: 'ai',
      timestamp: new Date()
    },
    {
      id: '2',
      content: '最近右边牙齿吃冷的东西会疼',
      sender: 'user',
      timestamp: new Date()
    },
    {
      id: '3',
      content: `根据您的描述，可能是以下几种情况:

1. 牙本质敏感 (可能性: 60%)
   • 症状: 冷热刺激痛，刺激去除后缓解
   • 建议: 使用抗敏感牙膏，避免冷热刺激

2. 龋齿 (可能性: 30%)
   • 症状: 冷热刺激痛，可能有黑点
   • 建议: 尽快就医检查

3. 牙隐裂 (可能性: 10%)
   • 症状: 咬合痛，冷热刺激痛
   • 建议: 需要专业检查确诊

💡 建议您:
• 近期避免冷热刺激性食物
• 如症状持续或加重，请及时就医
• 可以先尝试使用抗敏感牙膏

需要我帮您推荐附近的口腔医院吗？`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [countdown, setCountdown] = useState(29 * 60 + 45); // 29分45秒
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // 快速问题列表
  const quickQuestions: QuickQuestion[] = [
    { id: '1', text: '牙疼怎么办' },
    { id: '2', text: '牙龈出血' },
    { id: '3', text: '口腔溃疡' },
    { id: '4', text: '智齿问题' }
  ];

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 倒计时效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          endConversation();
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 格式化倒计时显示
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage('');

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: '感谢您的提问。根据您的描述，我需要了解更多细节才能给出更准确的建议。请您详细描述症状的持续时间、疼痛程度以及其他相关症状。',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // 处理快速问题点击
  const handleQuickQuestionClick = (question: string) => {
    setInputMessage(question);
  };

  // 处理上传图片
  const handleUploadImage = () => {
    toast('图片上传功能即将上线');
  };

  // 结束会话
  const endConversation = () => {
    toast('会话已结束，所有数据已销毁');
    navigate('/patient');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="h-[64px] bg-gradient-to-r from-[#10B981] to-[#059669] fixed top-0 left-0 right-0 z-10 shadow-md">
        <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between">
          {/* 左侧 Logo 和标题 */}
          <div className="flex items-center gap-2">
            <Brain size={24} className="text-white" />
            <div className="text-2xl font-bold text-white">AI健康助手</div>
          </div>
          
          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="px-3 py-1.5 border border-white/30 text-white rounded hover:bg-white/10 transition-colors text-sm hidden md:block"
            >
              退出登录
            </button>
            
            <button 
              className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="通知"
            >
              <Bell className="text-white" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-medium">
              李
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <main className="flex-grow pt-[64px] px-[40px] py-[32px] max-w-[900px] mx-auto w-full flex flex-col">
        {/* 隐私保护提示卡片 */}
        <div className="mb-6 bg-[#FEF3C7] border border-[#F59E0B] rounded-[12px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} className="text-[#F59E0B]" />
            <h2 className="font-bold text-gray-900">AI健康助手</h2>
          </div>
          
          <div className="flex items-start gap-2 mb-3">
            <Info size={18} className="text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-900">隐私保护模式已开启</p>
          </div>
          
          <ul className="text-sm text-gray-700 mb-3 space-y-1 pl-6 list-disc">
            <li>所有对话数据仅在本地处理，不上传服务器</li>
            <li>会话将在关闭后自动销毁</li>
            <li>本工具仅供参考，不能替代专业医疗诊断</li>
          </ul>
          
          <div className="flex items-center gap-2 text-[#F59E0B] font-medium">
            <Clock size={16} />
            <span>会话将在 [{formatCountdown(countdown)}] 后自动销毁</span>
          </div>
        </div>
        
        {/* 对话区域 */}
        <div 
          ref={chatContainerRef}
          className="flex-1 min-h-[500px] max-h-[600px] bg-white border border-gray-200 rounded-[12px] p-6 overflow-y-auto mb-6"
        >
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-6 ${message.sender === 'user' ? 'flex justify-end' : ''}`}
            >
              {message.sender === 'ai' ? (
                <div className="max-w-[80%]">
                  <div className="bg-[#F3F4F6] rounded-[12px] p-4 text-gray-800">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ) : (
                <div className="max-w-[80%]">
                  <div className="bg-[#10B981] rounded-[12px] p-4 text-white">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 快速问题区域 */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-500 mb-2">快速问题 (点击快速提问)</h3>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question) => (
              <button
                key={question.id}
                className="h-[36px] px-4 rounded-[18px] bg-[#E5E7EB] text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                onClick={() => handleQuickQuestionClick(question.text)}
              >
                {question.text}
              </button>
            ))}
          </div>
        </div>
        
        {/* 输入区域 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 h-[56px] bg-white border border-gray-200 rounded-[28px] px-4">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
              onClick={handleUploadImage}
            >
              <Image size={20} />
            </button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入您的症状..."
              className="flex-1 h-full outline-none text-gray-800"
            />
            
            <button
              className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center hover:bg-green-600 transition-colors"
              onClick={handleSendMessage}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        
        {/* 结束会话按钮 */}
        <div className="flex justify-center">
          <button
            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
            onClick={endConversation}
          >
            <Trash2 size={16} />
            <span>结束会话并销毁数据</span>
          </button>
        </div>
      </main>
    </div>
  );
}