import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import RecordCreatePage from "@/pages/RecordCreatePage";
import PatientHome from "@/pages/PatientHome";
import PatientAIChat from "@/pages/PatientAIChat";
import Login from "@/pages/Login";
import ThirdPartyVerifyHome from "@/pages/ThirdPartyVerifyHome";
import VerificationResultPage from "@/pages/VerificationResultPage";
import FileVerifyPage from "@/pages/FileVerifyPage";
import CertificateVerifyPage from "@/pages/CertificateVerifyPage";
import { useState, useEffect } from "react";
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import RuoYiLayout from "@/layouts/RuoYiLayout"; // 导入我们新写的壳

// 从本地存储获取认证状态
const getAuthFromLocalStorage = () => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    try {
      return JSON.parse(authData);
    } catch (e) {
      return { isAuthenticated: false, role: null };
    }
  }
  return { isAuthenticated: false, role: null };
};

export default function App() {
  // 初始化状态，优先从本地存储获取
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getAuthFromLocalStorage().isAuthenticated);
  const [role, setRole] = useState<'doctor' | 'patient' | 'third-party' | null>(getAuthFromLocalStorage().role);

  // 保存认证状态到本地存储
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify({ isAuthenticated, role }));
  }, [isAuthenticated, role]);

  const setAuthenticated = (authValue: boolean, userRole: 'doctor' | 'patient' | 'third-party' | null) => {
    setIsAuthenticated(authValue);
    setRole(userRole);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem('auth');
    toast('已成功登出');
  };

  // 路由守卫：检查用户是否有权访问特定路由
  const checkRouteAccess = (requiredRole: 'doctor' | 'patient' | 'third-party' | null, element: JSX.Element) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    // 如果需要特定角色且用户角色不匹配，则导航到该角色的首页
    if (requiredRole && role !== requiredRole) {
      if (role === 'doctor') return <Navigate to="/" />;
      if (role === 'patient') return <Navigate to="/patient" />;
      if (role === 'third-party') return <Navigate to="/verify" />;
    }
    
    return element;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, setAuthenticated, logout }}
    >
      <Routes>
        {/* 登录路由 */}
        <Route path="/login" element={isAuthenticated ? (
          role === 'doctor' ? <Navigate to="/" /> :
          role === 'patient' ? <Navigate to="/patient" /> :
          role === 'third-party' ? <Navigate to="/verify" /> :
          <Navigate to="/login" />
        ) : <Login />} />
        
        {/* 医生端路由 */}
        <Route path="/" element={checkRouteAccess('doctor', <Home />)} />
        <Route path="/other" element={checkRouteAccess('doctor', <RuoYiLayout><div className="text-center text-xl">Other Page - Coming Soon</div></RuoYiLayout>)} />
        <Route path="/records/create" element={checkRouteAccess('doctor', <RuoYiLayout><RecordCreatePage /></RuoYiLayout>)} />
        <Route path="/records/create/:patientId" element={checkRouteAccess('doctor', <RuoYiLayout><RecordCreatePage /></RuoYiLayout>)} />
        
        {/* 患者端路由 */}
        <Route path="/patient" element={checkRouteAccess('patient',<RuoYiLayout> <PatientHome /></RuoYiLayout>)} />
        <Route path="/patient/appointments" element={checkRouteAccess('patient', <div className="text-center text-xl">患者端 - 预约管理页面</div>)} />
        <Route path="/patient/appointments/:id" element={checkRouteAccess('patient', <div className="text-center text-xl">患者端 - 预约详情页面</div>)} />
        <Route path="/patient/appointments/new" element={checkRouteAccess('patient', <div className="text-center text-xl">患者端 - 新建预约页面</div>)} />
        <Route path="/patient/records" element={checkRouteAccess('patient', <div className="text-center text-xl">患者端 - 病历管理页面</div>)} />
        <Route path="/patient/records/:id" element={checkRouteAccess('patient', <div className="text-center text-xl">患者端 - 病历详情页面</div>)} />
        <Route path="/patient/reviews" element={checkRouteAccess('patient', <div className="text-center text-xl">患者端 - 医生评价页面</div>)} />
        <Route path="/patient/doctors/:id" element={checkRouteAccess('patient', <div className="text-center text-xl">患者端 - 医生详情页面</div>)} />
        <Route path="/patient/profile" element={checkRouteAccess('patient', <div className="text-center text-xl">患者端 - 个人信息页面</div>)} />
        <Route path="/patient/ai-chat" element={checkRouteAccess('patient',<RuoYiLayout> <PatientAIChat /></RuoYiLayout>)} />
        
        {/* 第三方验证机构路由 */}
        <Route path="/verify" element={checkRouteAccess('third-party',<RuoYiLayout> <ThirdPartyVerifyHome /></RuoYiLayout>)} />
        <Route path="/verify/files" element={checkRouteAccess('third-party',<RuoYiLayout> <FileVerifyPage /></RuoYiLayout>)} />
        <Route path="/verify/records" element={checkRouteAccess('third-party', <div className="text-center text-xl">第三方验证机构 - 验证记录页面</div>)} />
        <Route path="/verify/statistics" element={checkRouteAccess('third-party', <div className="text-center text-xl">第三方验证机构 - 统计分析页面</div>)} />
        <Route path="/verify/organization" element={checkRouteAccess('third-party', <div className="text-center text-xl">第三方验证机构 - 机构管理页面</div>)} />
        <Route path="/verify/certificate" element={checkRouteAccess('third-party',<RuoYiLayout> <CertificateVerifyPage /></RuoYiLayout>)} />
        <Route path="/verify/result" element={checkRouteAccess('third-party',<RuoYiLayout> <VerificationResultPage /></RuoYiLayout>)} />
        
        {/* 默认路由 */}
        <Route path="*" element={isAuthenticated ? (
          role === 'doctor' ? <Navigate to="/" /> :
          role === 'patient' ? <Navigate to="/patient" /> :
          role === 'third-party' ? <Navigate to="/verify" /> :
          <Navigate to="/login" />
        ) : <Navigate to="/login" />} />
      </Routes>
    </AuthContext.Provider>
  );
}
