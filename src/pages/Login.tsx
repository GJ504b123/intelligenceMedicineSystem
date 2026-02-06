import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import { User, FileCheck, Building, Lock, Mail, Eye, EyeOff, Heart, Activity } from 'lucide-react';
import { url } from 'zod/v4';

// 定义用户角色类型
type UserRole = 'doctor' | 'patient' | 'third-party';

// 定义用户信息接口
interface UserInfo {
  email: string;
  password: string;
  name: string;
  [key: string]: string | number; // 允许其他属性
}

// 定义模拟用户数据库接口
interface MockUsers {
  doctor: UserInfo & { hospital: string; license: string };
  patient: UserInfo & { age: number; gender: string };
  'third-party': UserInfo & { code: string };
}

export default function Login() {
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthContext);
  
  // 状态管理
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // 角色选择处理
  const handleRoleSelect = (role: UserRole): void => {
    setSelectedRole(role);
  };

  // 模拟用户数据库
  const mockUsers: MockUsers = {
    doctor: {
      email: 'doctor@example.com',
      password: 'password',
      name: '张医生',
      hospital: 'XX口腔医院',
      license: '110101199001011234'
    },
    patient: {
      email: 'patient@example.com',
      password: 'password',
      name: '李明',
      age: 32,
      gender: '男'
    },
    'third-party': {
      email: 'verify@example.com',
      password: 'password',
      name: 'ABC保险公司',
      code: '123456'
    }
  };

  // 登录处理函数
  const handleLogin = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!email || !password) {
      toast('请填写所有必填字段');
      return;
    }

    // 模拟登录验证
    const mockUser = mockUsers[selectedRole];
    if (email === mockUser.email && password === mockUser.password) {
      // 存储用户信息到本地存储
      localStorage.setItem('userInfo', JSON.stringify(mockUser));
      
      // 类型断言：假设setAuthenticated接受boolean和UserRole
      (setAuthenticated as (auth: boolean, role: UserRole) => void)(true, selectedRole);
      
      // 根据角色重定向
      switch (selectedRole) {
        case 'doctor':
          navigate('/');
          break;
        case 'patient':
          navigate('/patient');
          break;
        case 'third-party':
          navigate('/verify');
          break;
        default:
          navigate('/');
      }
      
      toast(`欢迎登录${selectedRole === 'doctor' ? '医生端' : selectedRole === 'patient' ? '患者端' : '第三方验证机构'}`);
    } else {
      toast('邮箱或密码不正确');
    }
  };

  // 密码显示切换
  const toggleShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  // 忘记密码处理
  const handleForgotPassword = (): void => {
    toast('忘记密码功能即将上线');
  };

  // 注册处理
  const handleRegister = (): void => {
    toast('注册功能即将上线');
  };

  // 快速登录处理
  const handleQuickLogin = (role: UserRole): void => {
    setSelectedRole(role);
    const user = mockUsers[role];
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 背景图片容器 */}
      <div className="absolute inset-0 z-0">
        {/* 背景图片 */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            // backgroundImage: '1/src/picture/1-2.jpg',
            backgroundImage: 'url("/src/picture/1-2.jpg")', // 测试用图片
            filter: 'brightness(0.9)' // 调整背景亮度
          }}
        ></div>
        {/* 半透明遮罩层 */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* 内容容器 - 确保在背景之上 */}
      <div className="relative z-10 w-full max-w-6xl mx-auto p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          {/* 左右分栏布局 */}
          <div className="flex flex-col md:flex-row">
            {/* 左侧品牌展示区 */}
            <div className="md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between">
              {/* Logo和标语 */}
              <div>
                <h1 className="text-3xl font-bold mb-2">医点就通</h1>
                <p className="text-xl opacity-90">Medical Data Platform</p>
              </div>
              
              {/* 系统描述 */}
              <div className="my-8">
                <p className="text-lg opacity-90">智能医疗存证系统，为医疗数据提供安全可信的存储与验证服务</p>
              </div>
              
              {/* 装饰性图标 */}
              <div className="relative h-40 w-40 mx-auto my-8">
                {/* 中心图标 - 听诊器 */}
                <Activity className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl opacity-70" />
                {/* 左侧图标 - 用户 */}
                <User className="absolute top-1/4 left-1/4 text-2xl opacity-50" />
                {/* 右侧图标 - 文件 */}
                <FileCheck className="absolute top-1/4 right-1/4 text-2xl opacity-50" />
                {/* 上方图标 - 心跳 */}
                <Heart className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 text-2xl opacity-50" />
              </div>
              
              {/* 统计数据 */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-sm opacity-80">系统可用性</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">5000+</p>
                  <p className="text-sm opacity-80">服务用户</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-sm opacity-80">数据安全</p>
                </div>
              </div>
            </div>

            {/* 右侧登录表单区 */}
            <div className="md:w-1/2 bg-white p-8 md:p-12 rounded-l-2xl md:rounded-l-none">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">欢迎回来</h2>
                <p className="text-gray-600 mb-8">请登录您的账号以继续</p>
                
                {/* 角色选择 */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <button 
                    onClick={() => handleRoleSelect('doctor')}
                    className={`py-3 px-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                      selectedRole === 'doctor' ? 'border-[#3b82f6] bg-[#eff6ff] text-[#3b82f6]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="选择医生角色"
                  >
                    <User className="mb-2 h-6 w-6" />
                    <span>医生</span>
                  </button>
                  
                  <button 
                    onClick={() => handleRoleSelect('patient')}
                    className={`py-3 px-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                      selectedRole === 'patient' ? 'border-[#3b82f6] bg-[#eff6ff] text-[#3b82f6]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="选择患者角色"
                  >
                    <User className="mb-2 h-6 w-6" />
                    <span>患者</span>
                  </button>
                  
                  <button 
                    onClick={() => handleRoleSelect('third-party')}
                    className={`py-3 px-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                      selectedRole === 'third-party' ? 'border-[#3b82f6] bg-[#eff6ff] text-[#3b82f6]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="选择第三方机构角色"
                  >
                    <Building className="mb-2 h-6 w-6" />
                    <span>第三方机构</span>
                  </button>
                </div>
                
                {/* 登录表单 */}
                <form onSubmit={handleLogin} className="space-y-6" noValidate>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入邮箱"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                      required
                      aria-required="true"
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-colors"
                      required
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-[#3b82f6] border-gray-300 rounded focus:ring-[#3b82f6]"
                        id="remember-me"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">记住我</label>
                    </div>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-[#3b82f6] hover:text-[#2563eb]"
                    >
                      忘记密码?
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    登录 <span className="ml-2">→</span>
                  </button>
                </form>
                
                {/* 注册链接 */}
                <div className="mt-6 text-center text-gray-600">
                  还没有账号?{" "}
                  <button
                    onClick={handleRegister}
                    className="text-[#3b82f6] hover:text-[#2563eb] font-medium"
                  >
                    立即注册
                  </button>
                </div>
                
                {/* 服务条款 */}
                <p className="text-xs text-gray-500 text-center mt-8">
                  登录即表示您同意我们的{" "}
                  <a href="#" className="text-[#3b82f6] hover:underline" target="_blank" rel="noopener noreferrer">服务条款</a>{" "}
                  和{" "}
                  <a href="#" className="text-[#3b82f6] hover:underline" target="_blank" rel="noopener noreferrer">隐私政策</a>
                </p>
                
                {/* 快速登录选项 */}
                <div className="mt-8">
                  <p className="text-sm text-gray-500 mb-3 text-center">快速登录</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickLogin('doctor')}
                      className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center"
                      aria-label="使用医生示例账号登录"
                    >
                      医生示例账号
                    </button>
                    
                    <button
                      onClick={() => handleQuickLogin('patient')}
                      className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center"
                      aria-label="使用患者示例账号登录"
                    >
                      患者示例账号
                    </button>
                    
                    <button
                      onClick={() => handleQuickLogin('third-party')}
                      className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center"
                      aria-label="使用验证机构示例账号登录"
                    >
                      验证机构示例账号
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}