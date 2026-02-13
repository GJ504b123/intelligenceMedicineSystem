import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, AlertCircle, RefreshCw, Loader2, Server, Activity } from 'lucide-react';
import RuoYiLayout from '@/layouts/RuoYiLayout';
import { listPatients } from '@/api/patientService';
import { Patient } from '@/api/types';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. 获取数据的业务逻辑
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await listPatients(searchQuery);
      if (res.code === 200 && res.rows) {
        setData(res.rows);
        toast.success(res.msg || '数据刷新成功');
      }
    } catch (error) {
      toast.error('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <RuoYiLayout>
      {/* 1. 顶部统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['今日挂号: 12', '待诊人数: 5', '已存证: 128', '异常预警: 2'].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-gray-500 text-xs font-medium uppercase mb-1">{item.split(':')[0]}</h3>
            <p className="text-2xl font-bold text-gray-800">{item.split(':')[1]}</p>
          </div>
        ))}
      </div>

      {/* 2. 新增区域：待处理影像任务 (体现设备自动推送) */}
      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Server size={18} className="text-blue-600" />
          待处理影像任务 (PACS 设备自动推送)
          <span className="ml-auto text-xs font-normal text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
            <Activity size={12} /> 实时连接正常
          </span>
        </h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-medium">影像流水号</th>
                <th className="py-3 px-4 font-medium">来源设备</th>
                <th className="py-3 px-4 font-medium">接收时间</th>
                <th className="py-3 px-4 font-medium">AI 预处理状态</th>
                <th className="py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* 模拟一条刚传过来的数据 */}
              <tr className="hover:bg-blue-50/30 transition-colors animate-in slide-in-from-left duration-500">
                <td className="py-3 px-4 font-mono text-blue-600">IMG-20260209-001</td>
                <td className="py-3 px-4">CT-Room-04 (头颅侧位)</td>
                <td className="py-3 px-4 text-gray-500">10:42:15</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs border border-green-100">
                    <Activity size={10} /> 完成
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button 
                    onClick={() => navigate('/records/create?patientId=P2026001&source=task')} 
                    // 加上 &source=task，告诉页面这是“立即接诊”
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    开始诊断
                  </button>
                </td>
              </tr>
              {/* 模拟一条正在处理的数据 */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono text-gray-600">IMG-20260209-002</td>
                <td className="py-3 px-4">Pano-Room-02 (曲面断层)</td>
                <td className="py-3 px-4 text-gray-500">10:38:20</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs border border-orange-100">
                    <Loader2 size={10} className="animate-spin" /> 处理中...
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 cursor-not-allowed">等待 AI</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 核心业务区：患者档案管理 (原有部分) */}
      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 min-h-[500px]">
        {/* 工具栏 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#1890ff] rounded-full"></div>
            <h2 className="text-base font-bold text-gray-800">患者档案库</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/records/create')}
              className="bg-[#1890ff] text-white px-4 py-2 rounded shadow-sm hover:bg-blue-600 transition-all flex items-center gap-2 text-sm font-bold"
            >
              <Plus size={16} /> 
              手动新建病历
            </button>
            <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2">
              <FileText size={16} /> 导出报表
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="flex gap-4 mb-6 flex-wrap items-center bg-gray-50 p-4 rounded border border-gray-100">
          <div className="flex items-center gap-2 w-64 border border-gray-300 rounded px-3 py-1.5 bg-white focus-within:border-[#1890ff] focus-within:ring-1 focus-within:ring-[#1890ff]">
            <span className="text-gray-500 text-sm whitespace-nowrap">患者搜索</span>
            <input 
              type="text" 
              className="outline-none text-sm w-full" 
              placeholder="姓名/病历号" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            />
          </div>
          <button onClick={fetchData} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:border-[#1890ff] hover:text-[#1890ff] transition-colors flex items-center gap-1">
            <Search size={14} /> 查询
          </button>
          <button onClick={() => { setSearchQuery(''); fetchData(); }} className="text-gray-500 text-sm hover:text-gray-700 flex items-center gap-1">
            <RefreshCw size={12} /> 重置
          </button>
        </div>

        {/* 表格区域 */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#1890ff]" size={32} />
            </div>
          )}

          <table className="w-full text-sm text-left">
            <thead className="bg-[#fafafa] text-gray-600 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-medium">病历号</th>
                <th className="py-3 px-4 font-medium">姓名</th>
                <th className="py-3 px-4 font-medium">科室</th>
                <th className="py-3 px-4 font-medium">风险评估</th>
                <th className="py-3 px-4 font-medium">状态</th>
                <th className="py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length > 0 ? (
                data.map((p) => (
                  <tr key={p.id} className="hover:bg-[#e6f7ff] transition-colors group">
                    <td className="py-3 px-4 text-[#1890ff] cursor-pointer font-mono">{p.id}</td>
                    <td className="py-3 px-4 font-medium">{p.name}</td>
                    <td className="py-3 px-4">{p.dept}</td>
                    <td className="py-3 px-4">
                      {p.riskLevel === '高' ? (
                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs w-fit border border-red-100">
                          <AlertCircle size={12} /> 风险预警
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs border ${
                        p.status === '待就诊' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                        p.status === '已存证' ? 'bg-green-50 border-green-200 text-green-600' :
                        'bg-blue-50 border-blue-200 text-blue-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#1890ff]">
                      <span className="cursor-pointer hover:underline mr-3">接诊</span>
                      <span className="cursor-pointer hover:underline">详情</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">暂无数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RuoYiLayout>
  );
}