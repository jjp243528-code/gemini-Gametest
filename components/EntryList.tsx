import React, { useState } from 'react';
import { GameEntry } from '../types';

interface EntryListProps {
  entries: GameEntry[];
  onDelete: (id: string) => void;
  onCopy: (entry: GameEntry) => void;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onDelete, onCopy, selectedIds, onToggleSelection }) => {
  // State to track which entries are expanded
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center border border-gray-200 h-full flex flex-col justify-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">暂无数据</h3>
        <p className="mt-1 text-sm text-gray-500">请在左侧表单添加试玩记录。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const isSelected = selectedIds.includes(entry.id);
        const isExpanded = expandedIds.has(entry.id);

        return (
          <div 
            key={entry.id} 
            className={`bg-white shadow rounded-lg overflow-hidden border transition hover:shadow-md ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
          >
            {/* Header / Summary Section - Clickable to toggle */}
            <div 
              className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none"
              onClick={() => toggleExpand(entry.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelection(entry.id)}
                  onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking checkbox
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{entry.gameName}</h3>
                    {!isExpanded && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600 hidden sm:inline-flex">
                        {entry.adGroups.length} 组策略
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span>{entry.date}</span>
                    <span>•</span>
                    <span>{entry.genre}</span>
                    {entry.duration && (
                      <>
                        <span>•</span>
                        <span className="bg-blue-100 text-blue-800 px-1.5 rounded font-medium">时长: {entry.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {/* Toggle Chevron */}
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-blue-500 rounded-full transition-colors focus:outline-none"
                  title={isExpanded ? "收起" : "展开"}
                >
                  {isExpanded ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                <div className="h-4 w-px bg-gray-300 mx-1"></div>

                <button
                  onClick={(e) => { e.stopPropagation(); onCopy(entry); }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors focus:outline-none"
                  title="复制/以此为模版录入"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                  title="删除记录"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Details Section */}
            {isExpanded && (
              <div className="px-6 py-4 space-y-4 border-t border-gray-100 animate-fadeIn">
                
                {/* Dynamic Ad Groups */}
                <div className="grid grid-cols-1 gap-3">
                  {entry.adGroups.map((group, idx) => (
                    <div key={group.id} className="bg-gray-50 rounded border border-gray-100 p-3">
                      <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              {group.name || `广告模块 ${idx + 1}`}
                            </div>
                        </div>
                      </div>
                      
                      {group.gameTime && (
                          <div className="mb-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {group.gameTime}
                                </span>
                          </div>
                        )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {group.attributes.map(attr => (
                          <div key={attr.id} className="flex justify-between text-sm">
                            <span className="text-gray-500">{attr.key}:</span>
                            <span className="text-gray-900 font-medium text-right truncate ml-2">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {entry.adGroups.length === 0 && (
                    <p className="text-sm text-gray-400 italic">暂无广告模块，请点击上方按钮添加</p>
                  )}
                </div>

                {/* Feedback */}
                {entry.notes && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">试玩反馈</span>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{entry.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EntryList;