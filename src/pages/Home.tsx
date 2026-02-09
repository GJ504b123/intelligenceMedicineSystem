import { useState, useEffect  } from 'react';
import { Search, Plus, FileText, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import RuoYiLayout from '@/layouts/RuoYiLayout';
import { listPatients } from '@/api/patientService'; // 引入接口
import { Patient } from '@/api/types'; // 引入类型
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  // 页面加载时自动请求
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <RuoYiLayout>
      {/* 顶部统计卡片保持不变... */}
      <div className="grid grid-cols-4 gap-4 mb-4">
         {/* ...省略之前的统计代码... */}
         <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm">
            <h3 className="text-gray-500 text-xs font-medium uppercase mb-2">系统状态</h3>
            <p className="text-xl font-bold text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              在线
            </p>
         </div>
      </div>

      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 min-h-[500px]">
        {/* 搜索栏 */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="flex items-center gap-2 w-64 border border-gray-300 rounded px-3 py-1.5 focus-within:border-[#1890ff] focus-within:ring-1 focus-within:ring-[#1890ff]">
            <span className="text-gray-500 text-sm">患者搜索</span>
            <input 
              type="text" 
              className="outline-none text-sm w-full" 
              placeholder="姓名/病历号" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            />
          </div>
          <button onClick={fetchData} className="bg-[#1890ff] text-white px-4 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1">
            <Search size={14} /> 查询
          </button>
          <button onClick={() => { setSearchQuery(''); fetchData(); }} className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded text-sm hover:border-[#1890ff] hover:text-[#1890ff] transition-colors flex items-center gap-1">
            <RefreshCw size={14} /> 重置
          </button>
        </div>

{/* 新增：标准 RuoYi 风格工具栏 */}
<div className="flex justify-between items-center mb-4 mt-6">
  <div className="flex items-center gap-2">
    {/* 装饰条，增加视觉实感 */}
    <div className="w-1 h-5 bg-[#1890ff] rounded-full"></div>
    <h2 className="text-base font-bold text-gray-800">患者就诊列表</h2>
  </div>
  
  <div className="flex gap-3">
    {/* 1. 核心按钮：新建数字化病历 */}
    <button 
      onClick={() => navigate('/records/create')}
      className="bg-[#1890ff] text-white px-4 py-2 rounded shadow-sm hover:bg-blue-600 transition-all flex items-center gap-2 text-sm font-bold"
    >
      <Plus size={18} /> 
      新建数字化病历
    </button>
    
    {/* 2. 辅助按钮：显得系统更完善 */}
    <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-2">
      <FileText size={16} /> 导出报表
    </button>
  </div>
</div>

        {/* 表格区域 */}
        <div className="relative">
          {/* Loading 遮罩 */}
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
                    <td className="py-3 px-4">{p.name}</td>
                    <td className="py-3 px-4">{p.dept}</td>
                    <td className="py-3 px-4">
                      {p.riskLevel === '高' ? (
                        <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs w-fit">
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