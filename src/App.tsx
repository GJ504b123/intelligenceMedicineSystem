import { useRoutes } from "react-router-dom";
import {getRoutes} from "./Routes"
import { useState, useEffect } from "react";
import { AuthContext } from "@/contexts/authContext";
import { toast } from "sonner";


// 从本地存储获取认证状态
//getAuthFromLocalStorage函数，从本地存储获取认证状态
// 返回值，isAuthenticated和role两个属性的对象，isAuthenticated表示是否登录，role表示用户角色
const getAuthFromLocalStorage = () => {
  // auth: { isAuthenticated: boolean, role: string | null }
  //auth这个名字从文件index.tsx中获取的，是getRoutes函数的参数
  // 如果本地存储有auth项，尝试解析为对象
  // 如果解析失败，返回默认值{ isAuthenticated: false, role: null }
  const authData = localStorage.getItem("auth");
  if (authData) {
    try {
      console.log("JSON.parse(authData)是：",JSON.parse(authData))
      return JSON.parse(authData);
      //catch必须有e，否则会报错，因为e是错误对象，必须有e参数
    } catch (e) {
      return { isAuthenticated: false, role: null };
    }
  }
  return { isAuthenticated: false, role: null };
};

export default function App() {
  // 初始化状态，优先从本地存储获取
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    getAuthFromLocalStorage().isAuthenticated
  );
  const [role, setRole] = useState<"doctor" | "patient" | "third-party" | null>(
    getAuthFromLocalStorage().role
  );

  // 保存认证状态到本地存储
  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify({ isAuthenticated, role }));
  }, [isAuthenticated, role]);

  const setAuthenticated = (
    authValue: boolean,
    userRole: "doctor" | "patient" | "third-party" | null
  ) => {
    // console.log("调用前 全局登录状态", isAuthenticated);

    setIsAuthenticated(authValue);
    setRole(userRole);
    // console.log("调用后 全局登录状态", userRole);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem("auth");//可以不写，我们有useEffect自动根据两个变量把状态写在浏览器里，但是为了安全，标准化，还是要写removeItem的
    toast("已成功登出");
  };

  // 路由守卫：检查用户是否有权访问特定路由
  // const checkRouteAccess = (
  //   requiredRole: "doctor" | "patient" | "third-party" | null,
  //   element: JSX.Element
  // ) => {
  //   if (!isAuthenticated) {
  //     return <Navigate to='/login' />;
  //   }

  //   // 如果需要特定角色且用户角色不匹配，则导航到该角色的首页
  //   if (requiredRole && role !== requiredRole) {
  //     if (role === "doctor") return <Navigate to='/' />;
  //     if (role === "patient") return <Navigate to='/patient' />;
  //     if (role === "third-party") return <Navigate to='/verify' />;
  //   }

  //   return element;
  // };

  //element是根据路由数组动态渲染的组件

  //useRoutes函数，根据路由数组渲染对应的组件,数组为空时，渲染null
  //useRoutes渲染逻辑：遍历路由数组，根据当前路由路径匹配路由数组中的path属性，如果匹配成功，渲染对应的element属性，否则渲染null
  //1 如果路由数组为空，渲染null
  //2 如果路由数组中没有匹配的path属性，渲染null
  //3 如果路由数组中匹配的path属性有多个，渲染第一个匹配的path属性对应的element属性

  //getRoutes函数，根据用户角色动态生成路由数组
  //路由数组是RouteObject[]类型，每个元素都是一个RouteObject对象，包含了路由的路径、元素、子路由等信息
  //每个RouteObject对象的path属性是字符串，表示路由的路径
  //每个RouteObject对象的element属性是JSX.Element，表示路由对应的组件
  const element = useRoutes(getRoutes({isAuthenticated,role}));
  return (
    //Provider组件，将认证状态和角色传递给子组件
    //Provider组件的value属性是对象，包含了isAuthenticated、role、setAuthenticated、logout四个属性
    //isAuthenticated表示是否登录，role表示用户角色，setAuthenticated表示设置认证状态，logout表示退出登录
    //Provider组件的子组件是element，是根据路由数组动态渲染的组件
    <AuthContext.Provider value ={{isAuthenticated,role,setAuthenticated,logout}}>
      {element}
    </AuthContext.Provider>
    // <AuthContext.Provider
    //   value={{ isAuthenticated, role, setAuthenticated, logout }}
    // >
    //   <Routes>
    //     {/* 登录路由 */}
    //     <Route
    //       path='/login'
    //       element={
    //         isAuthenticated ? (
    //           role === "doctor" ? (
    //             <Navigate to='/' />
    //           ) : role === "patient" ? (
    //             <Navigate to='/patient' />
    //           ) : role === "third-party" ? (
    //             <Navigate to='/verify' />
    //           ) : (
    //             <Navigate to='/login' />
    //           )
    //         ) : (
    //           <Login />
    //         )
    //       }
    //     />

    //     {/* 医生端路由 */}
    //     <Route path='/' element={checkRouteAccess("doctor", <Home />)} />
    //     <Route
    //       path='/other'
    //       element={checkRouteAccess(
    //         "doctor",
    //         <RuoYiLayout>
    //           <div className='text-center text-xl'>
    //             Other Page - Coming Soon
    //           </div>
    //         </RuoYiLayout>
    //       )}
    //     />
    //     <Route
    //       path='/records/create'
    //       element={checkRouteAccess(
    //         "doctor",
    //         <RuoYiLayout>
    //           <RecordCreatePage />
    //         </RuoYiLayout>
    //       )}
    //     />
    //     <Route
    //       path='/records/create/:patientId'
    //       element={checkRouteAccess(
    //         "doctor",
    //         <RuoYiLayout>
    //           <RecordCreatePage />
    //         </RuoYiLayout>
    //       )}
    //     />
    //     <Route path='/records' element={<RecordManagement />} />
    //     <Route path='/management' element={<PatientManagement />} />

    //     <Route path='/center' element={<VerifyCenter />} />

    //     {/* 患者端路由 */}

    //     <Route
    //       path='/patient'
    //       element={checkRouteAccess(
    //         "patient",
    //         <RuoYiLayout>
    //           {" "}
    //           <PatientHome />
    //         </RuoYiLayout>
    //       )}
    //     />
    //     <Route
    //       path='/patient/appointments'
    //       element={checkRouteAccess(
    //         "patient",
    //         <div className='text-center text-xl'>患者端 - 预约管理页面</div>
    //       )}
    //     />
    //     <Route
    //       path='/patient/appointments/:id'
    //       element={checkRouteAccess(
    //         "patient",
    //         <div className='text-center text-xl'>患者端 - 预约详情页面</div>
    //       )}
    //     />
    //     <Route
    //       path='/patient/appointments/new'
    //       element={checkRouteAccess(
    //         "patient",
    //         <div className='text-center text-xl'>患者端 - 新建预约页面</div>
    //       )}
    //     />
    //     <Route
    //       path='/patient/records'
    //       element={checkRouteAccess(
    //         "patient",
    //         <div className='text-center text-xl'>患者端 - 病历管理页面</div>
    //       )}
    //     />
    //     <Route
    //       path='/patient/records/:id'
    //       element={checkRouteAccess(
    //         "patient",
    //         <div className='text-center text-xl'>患者端 - 病历详情页面</div>
    //       )}
    //     />
    //     <Route
    //       path='/patient/reviews'
    //       element={checkRouteAccess(
    //         "patient",
    //         <div className='text-center text-xl'>患者端 - 医生评价页面</div>
    //       )}
    //     />
    //     <Route
    //       path='/patient/doctors/:id'
    //       element={checkRouteAccess(
    //         "patient",
    //         <div className='text-center text-xl'>患者端 - 医生详情页面</div>
    //       )}
    //     />
    //     <Route
    //       path='/patient/profile'
    //       element={checkRouteAccess(
    //         "patient",
    //         <div className='text-center text-xl'>患者端 - 个人信息页面</div>
    //       )}
    //     />
    //     <Route
    //       path='/patient/ai-chat'
    //       element={checkRouteAccess(
    //         "patient",
    //         <RuoYiLayout>
    //           {" "}
    //           <PatientAIChat />
    //         </RuoYiLayout>
    //       )}
    //     />

    //     {/* 第三方验证机构路由 */}
    //     <Route
    //       path='/verify'
    //       element={checkRouteAccess(
    //         "third-party",
    //         <RuoYiLayout>
    //           {" "}
    //           <ThirdPartyVerifyHome />
    //         </RuoYiLayout>
    //       )}
    //     />
    //     <Route
    //       path='/verify/files'
    //       element={checkRouteAccess(
    //         "third-party",
    //         <RuoYiLayout>
    //           {" "}
    //           <FileVerifyPage />
    //         </RuoYiLayout>
    //       )}
    //     />
    //     <Route
    //       path='/verify/records'
    //       element={checkRouteAccess(
    //         "third-party",
    //         <div className='text-center text-xl'>
    //           第三方验证机构 - 验证记录页面
    //         </div>
    //       )}
    //     />
    //     <Route
    //       path='/verify/statistics'
    //       element={checkRouteAccess(
    //         "third-party",
    //         <div className='text-center text-xl'>
    //           第三方验证机构 - 统计分析页面
    //         </div>
    //       )}
    //     />
    //     <Route
    //       path='/verify/organization'
    //       element={checkRouteAccess(
    //         "third-party",
    //         <div className='text-center text-xl'>
    //           第三方验证机构 - 机构管理页面
    //         </div>
    //       )}
    //     />
    //     <Route
    //       path='/verify/certificate'
    //       element={checkRouteAccess(
    //         "third-party",
    //         <RuoYiLayout>
    //           {" "}
    //           <CertificateVerifyPage />
    //         </RuoYiLayout>
    //       )}
    //     />
    //     <Route
    //       path='/verify/result'
    //       element={checkRouteAccess(
    //         "third-party",
    //         <RuoYiLayout>
    //           {" "}
    //           <VerificationResultPage />
    //         </RuoYiLayout>
    //       )}
    //     />
    //     {/* 默认路由 */}
    //     <Route
    //       path='*'
    //       element={
    //         isAuthenticated ? (
    //           role === "doctor" ? (
    //             <Navigate to='/' />
    //           ) : role === "patient" ? (
    //             <Navigate to='/patient' />
    //           ) : role === "third-party" ? (
    //             <Navigate to='/verify' />
    //           ) : (
    //             <Navigate to='/login' />
    //           )
    //         ) : (
    //           <Navigate to='/login' />
    //         )
    //       }
    //     />
    //   </Routes>
    // </AuthContext.Provider>
  );
}
