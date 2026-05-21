import { createContext } from "react";

type UserRole = 'doctor' | 'patient' | 'third-party' | null;

//1. 定义上下文，用于传递认证状态和角色
//AuthContext是上下文对象，用于定义认证状态和角色的结构，
//不是组件，而是通过AuthContext.Provider组件来传递状态
//useContext(AuthContext)是函数，用于从上下文中获取认证状态和角色
//为什么需要定义上下文？
//因为认证状态和角色是全局的，需要在多个组件中使用，
//如果使用props传递，会导致代码重复和维护困难，
//所以使用上下文传递认证状态和角色

//上下文对象的作用：
//1. 传递认证状态和角色
//2. 提供全局的认证状态和角色访问
//3. 避免props传递，提高代码可维护性
//4. 避免循环依赖问题

export const AuthContext = createContext({
  isAuthenticated: false,
  role: null as UserRole,
  setAuthenticated: (value: boolean, role: UserRole) => {},
  logout: () => {},
});