import { useState } from 'react';
// import RuoYiLayout from '@/layouts/RuoYiLayout';
import { 
  Folder, FileText, Search, Filter, MoreVertical, 
  Star, Clock, Trash2, Cloud, Download 
} from 'lucide-react';

export default function RecordManagement() {
  const [activeTab, setActiveTab] = useState('all');

  // 模拟文件夹结构
  const folders = [
    { id: 'all', label: '全部档案', icon: Folder },
    { id: 'star', label: '重点关注', icon: Star },
    { id: 'recent', label: '最近打开', icon: Clock },
    { id: 'cloud', label: '云端备份', icon: Cloud },
    { id: 'trash', label: '回收站', icon: Trash2 },
  ];

  // 模拟文档数据
  const records = [
    { id: 1, title: '李明 - 腺样体肥大初诊记录', date: '2026-02-09', size: '2.4 MB', type: 'PDF' },
    { id: 2, title: '王芳 - 根管治疗术后复查', date: '2026-02-08', size: '15.1 MB', type: 'DICOM' },
    { id: 3, title: '赵强 - 种植牙一期手术', date: '2026-02-05', size: '1.8 MB', type: 'PDF' },
    { id: 4, title: '孙小美 - 正畸方案确认书', date: '2026-02-01', size: '540 KB', type: 'DOCX' },
  ];

  return (
    <>
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* 左侧：文件夹导航 (Explorer Sidebar) */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors">
              + 上传旧病历
            </button>
          </div>
          <nav className="flex-1 px-2 space-y-1">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setActiveTab(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === folder.id 
                    ? 'bg-blue-100 text-blue-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <folder.icon size={18} />
                {folder.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">存储空间使用情况</p>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 w-[70%] h-full rounded-full"></div>
              </div>
              <p className="text-xs font-bold text-gray-700 mt-1 text-right">700GB / 1TB</p>
            </div>
          </div>
        </div>

        {/* 右侧：文件列表 (File List) */}
        <div className="flex-1 flex flex-col">
          {/* 工具栏 */}
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
            <h2 className="font-bold text-lg text-gray-800">文档列表</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="搜索病历..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                />
              </div>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* 列表内容 */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-3">
              {records.map(file => (
                <div key={file.id} className="group flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                    file.type === 'PDF' ? 'bg-red-50 text-red-500' :
                    file.type === 'DICOM' ? 'bg-blue-50 text-blue-500' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{file.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>{file.date}</span>
                      <span>•</span>
                      <span>{file.size}</span>
                      <span>•</span>
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{file.type}</span>
                    </div>
                  </div>
                  
                  {/* 悬停显示的操作按钮 */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="下载">
                      <Download size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}