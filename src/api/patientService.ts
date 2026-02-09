// src/api/patientService.ts
import { ApiResponse, Patient } from './types';

// 模拟数据库数据
const MOCK_DB: Patient[] = [
  { id: 'P2025020701', name: '李明', age: 32, gender: '男', dept: '口腔科', status: '待就诊', date: '2025-02-07', riskLevel: '无' },
  { id: 'P2025020702', name: '王芳', age: 45, gender: '女', dept: '牙周科', status: '诊断中', date: '2025-02-06', riskLevel: '高' },
  { id: 'P2025020703', name: '张伟', age: 28, gender: '男', dept: '修复科', status: '已存证', date: '2025-02-05', riskLevel: '无' },
  { id: 'P2025020704', name: '赵强', age: 56, gender: '男', dept: '种植科', status: '待就诊', date: '2025-02-07', riskLevel: '低' },
];

// 模拟获取患者列表接口
export const listPatients = (query?: string): Promise<ApiResponse<Patient>> => {
  return new Promise((resolve) => {
    // 模拟 500ms 的网络延迟，让Loading效果能展示出来，显得很真实
    setTimeout(() => {
      // 简单的模拟搜索逻辑
      let result = MOCK_DB;
      if (query) {
        result = MOCK_DB.filter(p => p.name.includes(query) || p.id.includes(query));
      }
      
      // 返回标准的 RuoYi 格式
      resolve({
        code: 200,
        msg: '查询成功',
        rows: result,
        total: result.length
      });
    }, 500); 
  });
};

// 模拟删除接口
export const deletePatient = (id: string): Promise<ApiResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ code: 200, msg: '删除成功' });
    }, 300);
  });
};