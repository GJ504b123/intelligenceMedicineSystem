// src/api/deviceService.ts
// 模拟与医院 PACS 系统和联邦学习节点的通信接口

// 1. 定义影像数据结构 (DICOM 标准)
export interface DicomImage {
    id: string;
    patientId: string;
    modality: 'CT' | 'DX' | 'CR'; // 影像类型
    deviceSource: string; // 来源设备
    captureTime: string;
    url: string; // 影像地址
    isCleaned?: boolean; // 是否经过清洗
  }
  
  // 2. 模拟连接影像设备 (PACS)
  // 真实场景：前端 -> 后端 API -> 医院内网 DICOM 协议 -> CT机
  export const connectToPacs = (deviceId: string): Promise<{ status: string; signal: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'connected', signal: 98 }); // 模拟信号强度 98%
      }, 1500);
    });
  };
  
  // 3. 模拟获取最新影像
  export const fetchLatestDicom = (): Promise<DicomImage> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `IMG-${Date.now()}`,
          patientId: 'P20260209',
          modality: 'CT',
          deviceSource: 'CT-Room-04 (Siemens Somatom)',
          captureTime: new Date().toISOString(),
          url: '/mock-dicom.jpg', // 这里放个占位符
          isCleaned: false
        });
      }, 2000);
    });
  };
  
  // 4. 模拟调用联邦学习清洗节点 (核心特色接口)
  export const invokeFederatedCleaning = (imageId: string): Promise<DicomImage> => {
    return new Promise((resolve) => {
      // 这里模拟一个较长的处理过程
      setTimeout(() => {
        resolve({
          id: `CLN-${imageId}`,
          patientId: 'ANONYMOUS', // 隐私计算已脱敏
          modality: 'CT',
          deviceSource: 'FL-Node-01 (Cleaned)',
          captureTime: new Date().toISOString(),
          url: '/mock-cleaned.jpg',
          isCleaned: true
        });
      }, 3000);
    });
  };