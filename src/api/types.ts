// src/api/types.ts

// 1. 通用的后端响应结构 (RuoYi 标准)
export interface ApiResponse<T = any> {
    code: number;      // 状态码，200 为成功
    msg: string;       // 提示信息
    data?: T;          // 单个对象数据
    rows?: T[];        // 列表数据
    total?: number;    // 分页总数
  }
  
  // 2. 定义具体的业务数据模型 (以患者为例)
  export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: '男' | '女';
    dept: string;      // 科室
    status: '待就诊' | '诊断中' | '已存证';
    date: string;      // 就诊日期
    riskLevel: '无' | '低' | '高'; // 风险等级
  }