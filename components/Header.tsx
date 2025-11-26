import React from 'react';

interface HeaderProps {
  entryCount: number;
  onExport: () => void;
  onInstall?: () => void;
  canInstall?: boolean;
  onOpenAttributeManager: () => void;
  selectedCount: number;
}

const Header: React.FC<HeaderProps> = ({ entryCount, onExport, onInstall, canInstall, onOpenAttributeManager, selectedCount }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            G
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">海外小游戏测评助手</h1>
            <p className="text-xs text-gray-500 hidden sm:block">广告数据追踪与分析系统</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">今日记录</span>
            <span className="text-lg font-bold text-gray-900">{entryCount} <span className="text-sm font-normal text-gray-500">条</span></span>
          </div>
          
          <button
            onClick={onOpenAttributeManager}
            className="inline-flex items-center p-2 border border-transparent text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            title="管理自定义模板"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {canInstall && onInstall && (
            <button
              onClick={onInstall}
              className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              title="安装到本地，离线也能使用"
            >
              <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">安装/下载 APP</span>
              <span className="sm:hidden">安装</span>
            </button>
          )}

          <button
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <svg className="-ml-1 sm:mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">
              {selectedCount > 0 ? `导出选中 (${selectedCount})` : '导出 Excel'}
            </span>
            <span className="sm:hidden">
              {selectedCount > 0 ? `导出(${selectedCount})` : '导出'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;