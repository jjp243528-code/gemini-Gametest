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
  // State to track which entries are expanded (default: empty set = all collapsed)
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
        <div className="flex justify-center mb-4">
          <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900">暂无数据</h3>
        <p className="mt-1 text-sm text-gray-500">左侧表单录入后将显示在此处</p>
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
            className={`bg-white shadow rounded-lg overflow-hidden border transition-all duration-200 hover:shadow-md ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
          >
            {/* Header / Summary Section - Clickable to toggle */}
            <div 
              className={`px-4 sm:px-6 py-4 flex justify-between items-center cursor-pointer select-none transition-colors ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => toggleExpand(entry.id)}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                   <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(entry.id)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{entry.gameName}</h3>
                    {!isExpanded && entry.adGroups.length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {entry.adGroups.length} 组策略
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{entry.date}</span>
                    {entry.genre && <span className="text-gray-400">|</span>}
                    {entry.genre && <span>{entry.genre}</span>}
                    {entry.duration && <span className="text-gray-400">|</span>}
                    {entry.duration && (
                      <span className="font-medium text-blue-600">时长: {entry.duration}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {/* Actions that shouldn't trigger toggle */}
                <div className="flex items-center border-r border-gray-200 pr-2 mr-1 gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onCopy(entry); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="复制/以此为模版"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="删除记录"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>

                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                   <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
              </div>
            </div>
            
            {/* Details Section */}
            {isExpanded && (
              <div className="px-4 sm:px-6 py-4 space-y-4 bg-white animate-fadeIn">
                {/* Dynamic Ad Groups */}
                <div className="grid grid-cols-1 gap-4">
                  {entry.adGroups.map((group, idx) => (
                    <div key={group.id} className="bg-gray-50/50 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">#{idx + 1}</span>
                        <span className="font-medium text-gray-900">{group.name}</span>
                        
                        {group.gameTime && (
                           <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {group.gameTime}
                           </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        {group.attributes.map(attr => (
                          <div key={attr.id} className="flex gap-2 py-1 border-b border-gray-100 last:border-0">
                            <span className="text-gray-500 flex-shrink-0">{attr.key}:</span>
                            <span className="text-gray-900 font-medium truncate">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {entry.adGroups.length === 0 && (
                    <div className="text-center text-sm text-gray-400 italic py-2">无广告策略详情</div>
                  )}
                </div>

                {/* Feedback */}
                {entry.notes && (
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">试玩反馈 / 备注</span>
                    <div className="text-sm text-gray-700 bg-yellow-50/50 p-3 rounded-md border border-yellow-100 whitespace-pre-wrap leading-relaxed">
                      {entry.notes}
                    </div>
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