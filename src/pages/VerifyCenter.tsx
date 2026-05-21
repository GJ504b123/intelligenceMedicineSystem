// import RuoYiLayout from '@/layouts/RuoYiLayout';
import { ShieldCheck, Hash, Blocks, CheckCircle2, Activity, Server, Database } from 'lucide-react';

export default function VerifyCenter() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">区块链存证控制台</h1>
        <p className="text-gray-500 mt-1">FISCO BCOS 联盟链节点实时监控中...</p>
      </div>

      {/* 顶部核心指标：深色极客风 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Blocks size={80} />
          </div>
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-bold uppercase tracking-wider">
            <Activity size={14} className="text-green-400" /> 最新区块高度
          </div>
          <div className="text-4xl font-mono font-bold tracking-widest text-green-400">#8,291,042</div>
          <div className="mt-4 text-xs text-slate-500">Block Height (Real-time)</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm font-bold uppercase">
            <Hash className="text-purple-500" size={16} /> 今日上链交易量
          </div>
          <div className="text-4xl font-bold text-gray-900">1,024 <span className="text-base font-normal text-gray-400">TXs</span></div>
          <div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 w-fit px-2 py-1 rounded">
            <TrendingUp size={12} /> 同比增长 12.5%
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm font-bold uppercase">
            <Server className="text-blue-500" size={16} /> 节点健康状态
          </div>
          <div className="text-4xl font-bold text-blue-600">Running</div>
          <div className="mt-4 text-xs text-gray-400">
            Latency: 12ms | Peers: 8/12
          </div>
        </div>
      </div>

      {/* 实时数据流列表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Database size={18} className="text-blue-600" /> 最新上链存证记录
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-mono bg-green-100 px-2 py-1 rounded">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs">TX</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-slate-700 font-bold">0x7f2c...9a1b{i}</span>
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 rounded border border-gray-200">SHA-256</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">From: Node-BJ-04 &rarr; To: SmartContract</div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-600">Block #{8291040+i}</div>
                  <div className="text-[10px] text-gray-400">{i * 2} mins ago</div>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full border border-green-100 group-hover:bg-green-100 transition-colors">
                  <CheckCircle2 size={14} /> CONFIRMED
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// 补一个 TrendingUp 图标定义，避免报错
function TrendingUp({ size, className }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}