import { Navigate, RouteObject } from "react-router-dom";
import RuoYiLayout from "@/layouts/RuoYiLayout";
import PatientManagement from "@/pages/PatientManagement";
import RecordManagement from "@/pages/RecordManagement";
import VerifyCenter from "@/pages/VerifyCenter";
import Home from "@/pages/Home";
import RecordCreatePage from "@/pages/RecordCreatePage";
import PatientHome from "@/pages/PatientHome";
import PatientAIChat from "@/pages/PatientAIChat";
import Login from "@/pages/Login";
import ThirdPartyVerifyHome from "@/pages/ThirdPartyVerifyHome";
import VerificationResultPage from "@/pages/VerificationResultPage";
import FileVerifyPage from "@/pages/FileVerifyPage";
import CertificateVerifyPage from "@/pages/CertificateVerifyPage";

// 1. 路由守卫组件
//回调函数，用于检查路由权限，根据角色跳转到对应的默认页或登录页
// auth参数，包含isAuthenticated和role两个属性，isAuthenticated表示是否登录，role表示用户角色
const AuthGuard = ({
  element,
  requiredRole,
  auth,
}: {
  element: JSX.Element;
  requiredRole: string;
  auth: { isAuthenticated: boolean; role: string | null };
}) => {
  if (!auth.isAuthenticated) return <Navigate to='/login' replace />; // 未登录，跳转到登录页
  // 检查角色是否匹配
  if (requiredRole && auth.role !== requiredRole) {
    // 角色不匹配，跳转到角色的默认页
    // 角色映射表homeMap，角色是键，对应的默认页是值
    const homeMap: Record<string, string> = {
      doctor: "/",
      patient: "/patient",
      "third-party": "/verify",
    };
    // Navigate组件，根据角色跳转到对应的默认页或登录页,to属性指定跳转路径，replace属性指定是否替换当前路由
    //||是短路运算符，如果auth.role为null，会返回空字符串，然后根据homeMap[""] || "/login"，会跳转到登录页
    //replace属性为true，会替换当前路由，而不是添加到路由历史记录
    return <Navigate to={homeMap[auth.role || ""] || "/login"} replace />;
  }
  // 角色匹配，渲染对应的元素
  return element;
};

// 2. 定义路由数组
//getRoutes函数，根据用户角色动态生成路由数组
// auth参数，包含isAuthenticated和role两个属性，isAuthenticated表示是否登录，role表示用户角色
// 返回值，RouteObject[]类型，每个元素都是一个RouteObject对象，包含了路由的路径、元素、子路由等信息
export const getRoutes = (auth: {
  isAuthenticated: boolean;
  role: string | null;
}): RouteObject[] => [
  {
    // 登录路由：独立在外，不套壳
    path: "/login",
    element: auth.isAuthenticated ? (
      auth.role === "doctor" ? (
        <Navigate to='/' replace />
      ) : auth.role === "patient" ? (
        <Navigate to='/patient' replace />
      ) : (
        <Navigate to='/verify' replace />
      )
    ) : (
      // 这里的冒号表示如果auth.role为null，会跳转到登录页，而不是默认页
      //项目的默认页是首页，即/路径
      <Login />
    ),
  },

  // --- 医生端路由组：统一套壳 + 统一鉴权 ---
  {
    path: "/",
    //auth={auth}，将认证状态和角色传递给AuthGuard组件
    //AuthGuard组件，根据角色跳转到对应的默认页或登录页
    //auth从Provider组件传递过来的，包含了isAuthenticated和role两个属性
    element: (
      <AuthGuard auth={auth} requiredRole='doctor' element={<RuoYiLayout />} />
    ),//element：父路由
    //outlet组件，渲染子组件，根据路由匹配渲染对应的组件
    //children数组，包含了子路由的配置
    children: [
      //index是默认路由，匹配/路径，渲染Home组件，作为默认页
      { index: true, element: <Home /> },
      {
        path: "other",
        element: (
          <div className='text-center text-xl'>Other Page - Coming Soon</div>
        ),
      },
      { path: "records", element: <RecordManagement /> },
      { path: "records/create", element: <RecordCreatePage /> },
      { path: "records/create/:patientId", element: <RecordCreatePage /> },
      { path: "management", element: <PatientManagement /> },
      { path: "center", element: <VerifyCenter /> },
    ],
  },

  // --- 患者端路由组：统一套壳 + 统一鉴权 ---
  {
    path: "/patient",
    element: (
      <AuthGuard auth={auth} requiredRole='patient' element={<RuoYiLayout />} />
    ),
    children: [
      { index: true, element: <PatientHome /> },
      { path: "ai-chat", element: <PatientAIChat /> },
      {
        path: "profile",
        element: <div className='text-center text-xl'>个人信息页面</div>,
      },
      {
        path: "records",
        element: <div className='text-center text-xl'>病历管理页面</div>,
      },
      {
        path: "records/:id",
        element: <div className='text-center text-xl'>病历详情页面</div>,
      },
      {
        path: "appointments",
        element: <div className='text-center text-xl'>预约管理页面</div>,
      },
      {
        path: "appointments/new",
        element: <div className='text-center text-xl'>新建预约页面</div>,
      },
      {
        path: "appointments/:id",
        element: <div className='text-center text-xl'>预约详情页面</div>,
      },
    ],
  },

  // --- 第三方验证路由组：统一套壳 + 统一鉴权 ---
  {
    path: "/verify",
    element: (
      <AuthGuard
        auth={auth}
        requiredRole='third-party'
        element={<RuoYiLayout />}
      />
    ),
    children: [
      { index: true, element: <ThirdPartyVerifyHome /> },
      { path: "files", element: <FileVerifyPage /> },
      { path: "certificate", element: <CertificateVerifyPage /> },
      { path: "result", element: <VerificationResultPage /> },
      {
        path: "records",
        element: <div className='text-center text-xl'>验证记录页面</div>,
      },
      {
        path: "statistics",
        element: <div className='text-center text-xl'>统计分析页面</div>,
      },
      {
        path: "organization",
        element: <div className='text-center text-xl'>机构管理页面</div>,
      },
    ],
  },

  // 兜底路由
  {
    path: "*",
    element: <Navigate to='/login' replace />,
  },
];
