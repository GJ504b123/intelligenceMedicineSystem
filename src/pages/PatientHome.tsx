import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  User, Bell, Search, Brain, FileText, Shield, 
  Calendar as CalendarIcon, Clock, RefreshCw, 
  LayoutDashboard, Activity, MessageSquare 
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

// 模拟通知数据
const notificationItems = [
  {
    id: '1',
    type: 'authorization',
    icon: <Bell className="text-orange-500" size={18} />,
    title: '您有1条新的授权请求待处理',
    details: '请求查看: 2024年度口腔检查报告',
    doctorName: '王医生',
    hospital: 'XX口腔医院'
  },
  {
    id: '2',
    type: 'report',
    icon: <FileText className="text-blue-500" size={18} />,
    title: '您有1份新的诊断报告可查看',
    details: '来自: 张医生 (XX口腔医院)',
    time: '2025-01-10'
  }
];

export default function PatientHome() {
  const navigate = useNavigate();


  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 侧边导航栏 - 患者端绿色主题 */}


      {/* 主体内容 */}
      <main className="flex-1  p-10">


        {/* 欢迎卡片 */}
        <div className="bg-gradient-to-r from-[#059669] to-[#10B981] rounded-2xl p-8 text-white shadow-lg mb-10 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">数字化医疗助手为您服务</h2>
            <p className="opacity-90 max-w-xl">您有 2 份新的检查报告已生成数字存证，医生建议您近期关注牙周健康。</p>
            <button className="mt-6 px-6 py-2 bg-white text-green-700 rounded-full font-bold hover:bg-green-50 transition-colors">
              查看最新报告
            </button>
          </div>
          <Activity className="absolute right-10 top-1/2 -translate-y-1/2 text-white opacity-10" size={180} />
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { name: 'AI 智能自查', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', action: () => navigate('/patient/ai-chat') },
            { name: '我的电子病历', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', action: () => navigate('/patient/records') },
            { name: '授权管理', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', action: () => toast('功能开发中') },
            { name: '在线问诊', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', action: () => toast('功能开发中') },
          ].map((item) => (
            <div 
              key={item.name} 
              onClick={item.action}
              className={`h-[140px] rounded-2xl border ${item.border} ${item.bg} flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all hover:-translate-y-1`}
            >
              <div className={`p-3 rounded-full bg-white shadow-sm mb-3 ${item.color}`}>
                <item.icon size={28} />
              </div>
              <span className="font-bold text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>

        {/* 通知中心 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Bell className="text-gray-400" size={20} /> 消息通知
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {notificationItems.map((item, index) => (
              <div key={item.id} className={`p-6 flex items-start gap-4 ${index !== notificationItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.details}</p>
                  {item.time && <p className="text-xs text-gray-400 mt-2">{item.time}</p>}
                </div>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-600">
                  查看详情
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}