import React, { useState, useRef, useEffect } from 'react';
import { GameEntry, AdGroup, AdAttribute, CustomAttributeMap } from '../types';

interface EntryFormProps {
  onAddEntry: (entry: GameEntry) => void;
  initialData?: GameEntry | null; // Prop to receive data for copying
  onClearInitialData?: () => void; // Prop to clear the selection after loading
  customAttributes: CustomAttributeMap;
  onUpdateCustomAttributes: (newAttributes: CustomAttributeMap) => void;
}

const AD_TYPE_OPTIONS = ["插屏广告", "激励视频", "视频+插屏广告", "可互动广告", "Banner"];
const AD_POSITION_OPTIONS = ["屏幕顶部", "屏幕底部", "屏幕左侧", "屏幕右侧", "屏幕中心", "全屏幕"];
const AD_FREQUENCY_OPTIONS = ["极高", "高", "中", "低"];
const AD_COUNT_OPTIONS = ["1次", "2次", "3次", "5次", "10次", "无限/循环", "每关1次", "每日限制"];
const AD_CONTENT_OPTIONS: string[] = []; 
const AD_DURATION_OPTIONS = ["5秒", "15秒", "30秒", "45秒", "60秒", "大于60秒"];
const AD_TRIGGER_OPTIONS = ["主动点击", "被动弹出", "通关失败", "通关成功", "资源不足", "时间间隔"];

// Updated options for Game Time input
const GAME_TIME_OPTIONS = ["0-10分钟，新手引导", "10-30分钟", "30-60分钟", "60分钟后"];

const DEFAULT_ATTRIBUTES = [
  { key: '广告类型', value: '' },
  { key: '广告位置', value: '' },
  { key: '出现频率', value: '' },
  { key: '出现次数', value: '' },
  { key: '广告一', value: '' },
  { key: '时长', value: '' },
  { key: '广告二', value: '' },
  { key: '时长二', value: '' },
  { key: '触发条件', value: '' }
];

// Safe ID generator that works in non-secure contexts too
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const EntryForm: React.FC<EntryFormProps> = ({ onAddEntry, initialData, onClearInitialData, customAttributes, onUpdateCustomAttributes }) => {
  const [gameName, setGameName] = useState('');
  const [genre, setGenre] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  
  // --- Timer System State ---
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleTimerToggle = () => setIsTimerRunning(!isTimerRunning);
  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };
  const handleFillDuration = () => {
    setDuration(formatTime(timerSeconds));
  };

  const saveCustomOption = (key: string, value: string) => {
    if (!value || !value.trim()) return;
    const cleanValue = value.trim();
    
    const existing = customAttributes[key] || [];
    if (existing.includes(cleanValue)) return;
    
    const updated = { ...customAttributes, [key]: [...existing, cleanValue] };
    onUpdateCustomAttributes(updated);
  };

  const deleteCustomOption = (key: string, value: string) => {
    const existing = customAttributes[key] || [];
    const updated = { ...customAttributes, [key]: existing.filter(v => v !== value) };
    onUpdateCustomAttributes(updated);
  };
  
  const [adGroups, setAdGroups] = useState<AdGroup[]>([
    {
      id: generateId(),
      name: '默认广告模块',
      gameTime: '',
      attributes: DEFAULT_ATTRIBUTES.map(attr => ({ ...attr, id: generateId() }))
    }
  ]);

  useEffect(() => {
    if (initialData) {
      setGameName(initialData.gameName);
      setGenre(initialData.genre);
      setNotes(initialData.notes);
      setDuration(initialData.duration || '');
      
      const copiedGroups = initialData.adGroups.map(g => ({
        ...g,
        id: generateId(),
        attributes: g.attributes.map(a => ({ ...a, id: generateId() }))
      }));
      setAdGroups(copiedGroups);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onClearInitialData) onClearInitialData();
    }
  }, [initialData, onClearInitialData]);

  // Drag and Drop Refs and State
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragEnabled, setDragEnabled] = useState(false);

  const dragAttrStart = useRef<{ gIdx: number; aIdx: number } | null>(null);
  const dragAttrEnter = useRef<{ gIdx: number; aIdx: number } | null>(null);
  const [attrDragEnabled, setAttrDragEnabled] = useState(false);

  const addGroup = () => {
    setAdGroups(prev => [
      ...prev,
      {
        id: generateId(),
        name: `广告模块 ${prev.length + 1}`,
        gameTime: '',
        attributes: DEFAULT_ATTRIBUTES.map(attr => ({ ...attr, id: generateId() }))
      }
    ]);
  };

  const duplicateGroup = (groupId: string) => {
    const index = adGroups.findIndex(g => g.id === groupId);
    if (index === -1) return;

    const groupToCopy = adGroups[index];
    const newGroup: AdGroup = {
      ...groupToCopy,
      id: generateId(),
      name: `${groupToCopy.name} (复制)`,
      attributes: groupToCopy.attributes.map(attr => ({
        ...attr,
        id: generateId()
      }))
    };

    const newGroups = [...adGroups];
    newGroups.splice(index + 1, 0, newGroup);
    setAdGroups(newGroups);
  };

  const removeGroup = (groupId: string) => {
    setAdGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const updateGroupField = (groupId: string, field: 'name' | 'gameTime', value: string) => {
    setAdGroups(prev => prev.map(g => g.id === groupId ? { ...g, [field]: value } : g));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    e.currentTarget.classList.add('opacity-50', 'ring-2', 'ring-blue-400');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'ring-2', 'ring-blue-400');
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copyListItems = [...adGroups];
      const dragItemContent = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      copyListItems.splice(dragOverItem.current, 0, dragItemContent);
      setAdGroups(copyListItems);
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleAttrDragStart = (e: React.DragEvent<HTMLDivElement>, gIdx: number, aIdx: number) => {
    dragAttrStart.current = { gIdx, aIdx };
    e.stopPropagation();
    e.currentTarget.classList.add('opacity-50', 'bg-gray-50');
  };

  const handleAttrDragEnter = (e: React.DragEvent<HTMLDivElement>, gIdx: number, aIdx: number) => {
    if (dragAttrStart.current?.gIdx === gIdx) {
      dragAttrEnter.current = { gIdx, aIdx };
    }
  };

  const handleAttrDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'bg-gray-50');
    
    const start = dragAttrStart.current;
    const end = dragAttrEnter.current;

    if (start && end && start.gIdx === end.gIdx && start.aIdx !== end.aIdx) {
      setAdGroups(prev => {
        const newGroups = [...prev];
        const group = { ...newGroups[start.gIdx] };
        const newAttrs = [...group.attributes];
        
        const [movedAttr] = newAttrs.splice(start.aIdx, 1);
        newAttrs.splice(end.aIdx, 0, movedAttr);
        
        group.attributes = newAttrs;
        newGroups[start.gIdx] = group;
        return newGroups;
      });
    }
    
    dragAttrStart.current = null;
    dragAttrEnter.current = null;
    setAttrDragEnabled(false);
  };

  const addAttribute = (groupId: string) => {
    setAdGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          attributes: [...g.attributes, { id: generateId(), key: '', value: '' }]
        };
      }
      return g;
    }));
  };

  const removeAttribute = (groupId: string, attrId: string) => {
    setAdGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          attributes: g.attributes.filter(a => a.id !== attrId)
        };
      }
      return g;
    }));
  };

  const updateAttribute = (groupId: string, attrId: string, field: 'key' | 'value', val: string) => {
    setAdGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          attributes: g.attributes.map(a => a.id === attrId ? { ...a, [field]: val } : a)
        };
      }
      return g;
    }));
  };

  const handleCountAdjust = (groupId: string, attrId: string, currentVal: string, delta: number) => {
    // Extract the numerical part
    const numMatch = currentVal.match(/(\d+)/);
    let baseNum = numMatch ? parseInt(numMatch[0], 10) : 0;
    
    // Calculate new number
    let newNum = baseNum + delta;
    if (newNum < 0) newNum = 0; 
    
    // Automatically append '次' for consistency
    updateAttribute(groupId, attrId, 'value', `${newNum}次`);
  };

  const resetForm = () => {
    setGameName('');
    setGenre('');
    setNotes('');
    setDuration('');
    handleTimerReset(); 
    
    setAdGroups([{
      id: generateId(),
      name: '默认广告模块',
      gameTime: '',
      attributes: DEFAULT_ATTRIBUTES.map(attr => ({ ...attr, id: generateId() }))
    }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName) return;
    
    const newEntry: GameEntry = {
      id: generateId(),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      gameName,
      genre,
      duration,
      adGroups: JSON.parse(JSON.stringify(adGroups)),
      notes
    };

    onAddEntry(newEntry);
    resetForm();
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          录入新数据
        </h2>
        <button 
          type="button" 
          onClick={resetForm}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          清空/重置
        </button>
      </div>
      
      <div className="bg-blue-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-mono font-bold tracking-widest">
            {formatTime(timerSeconds)}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTimerToggle}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${isTimerRunning ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {isTimerRunning ? '暂停' : '开始'}
            </button>
            <button
              type="button"
              onClick={handleTimerReset}
              className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              重置
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <span className="text-xs text-blue-200 whitespace-nowrap hidden sm:inline">试玩计时器</span>
           <button
             type="button"
             onClick={handleFillDuration}
             className="flex-grow sm:flex-grow-0 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-xs rounded border border-blue-500 transition-colors flex items-center justify-center gap-1"
           >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             填入时长
           </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="gameName" className="block text-sm font-medium text-gray-700">游戏名称 <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="gameName"
              required
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="输入游戏名称"
            />
          </div>
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">游戏类型</label>
            <input
              type="text"
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="如: 休闲, 放置"
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">试玩时长</label>
            <input
              type="text"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="如: 00:15:30"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <label className="block text-sm font-bold text-gray-900">广告策略大模块</label>
            <button
              type="button"
              onClick={addGroup}
              className="text-xs inline-flex items-center font-medium text-blue-600 hover:text-blue-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              添加广告模块
            </button>
          </div>

          {adGroups.map((group, index) => (
            <div 
              key={group.id} 
              className="bg-white rounded-lg p-3 border border-gray-200 relative group-container transition-all shadow-sm"
              draggable={dragEnabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
            >
              {/* Header Line */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-grow min-w-0">
                  <div 
                    className="cursor-move text-gray-400 hover:text-gray-600 p-2 -ml-2 rounded hover:bg-gray-100 flex-shrink-0"
                    onMouseEnter={() => setDragEnabled(true)}
                    onMouseLeave={() => setDragEnabled(false)}
                    title="按住拖动调整顺序"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>

                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">#{index + 1}</span>
                  
                  <input 
                    id={`group-name-${group.id}`}
                    type="text"
                    value={group.name}
                    onChange={(e) => updateGroupField(group.id, 'name', e.target.value)}
                    className="flex-grow text-sm font-medium bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 focus:outline-none px-1 py-1 min-w-0 truncate"
                    placeholder="模块名称 (如: 激励视频)"
                  />
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0 bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`group-name-${group.id}`);
                      if (el) {
                        el.focus();
                        (el as HTMLInputElement).select();
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm"
                    title="重命名模块"
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicateGroup(group.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm"
                    title="复制该模块"
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  </button>

                  {adGroups.length > 0 && (
                     <button
                      type="button"
                      onClick={() => removeGroup(group.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-md transition-all shadow-sm"
                      title="删除该模块"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Intermediate Module: Game Time/Progress - Mobile Optimized */}
              <div className="mx-2 mt-3 mb-4 p-3 bg-orange-50/50 border border-orange-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                   <div className="text-orange-500 flex-shrink-0">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <span className="text-sm font-semibold text-gray-700">游戏时间/进度</span>
                </div>
                
                <div className="relative">
                  {(group.gameTime === '' || GAME_TIME_OPTIONS.includes(group.gameTime || '')) ? (
                    <div className="relative">
                      <select
                        value={group.gameTime || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'CUSTOM_GAMETIME') {
                            updateGroupField(group.id, 'gameTime', ' ');
                          } else {
                            updateGroupField(group.id, 'gameTime', val);
                          }
                        }}
                        className="w-full text-sm bg-white border border-orange-200 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none appearance-none pr-8"
                      >
                        <option value="" disabled className="text-gray-400">请选择...</option>
                        {GAME_TIME_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option disabled>──────────</option>
                        <option value="CUSTOM_GAMETIME" className="text-blue-600 font-medium">✍️ 自定义输入...</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  ) : (
                     <div className="relative">
                      <input
                        type="text"
                        value={group.gameTime === ' ' ? '' : group.gameTime}
                        onChange={(e) => updateGroupField(group.id, 'gameTime', e.target.value)}
                        placeholder="请输入游戏时间..."
                        className="w-full text-sm bg-white border border-orange-200 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none placeholder-gray-400"
                        autoFocus={group.gameTime === ' '}
                      />
                      <button
                        type="button"
                        onClick={() => updateGroupField(group.id, 'gameTime', '')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Attributes Sub-modules */}
              <div className="space-y-2 pl-8">
                {group.attributes.map((attr, attrIndex) => {
                  const isAdType = attr.key === '广告类型';
                  const isAdPosition = attr.key === '广告位置';
                  const isAdFrequency = attr.key === '出现频率';
                  const isAdCount = attr.key === '出现次数';
                  const isAdContent = attr.key === '广告内容';
                  const isAd1 = attr.key === '广告一';
                  const isAd2 = attr.key === '广告二';
                  const isAdDuration = attr.key === '时长';
                  const isAdDuration2 = attr.key === '时长二';
                  const isAdTrigger = attr.key === '触发条件';
                  
                  // Use generic dropdown logic for everything except '出现次数'
                  // Added isAd1 and isAd2 to support custom templates dropdowns
                  const isDropdownField = !isAdCount && (isAdType || isAdPosition || isAdFrequency || isAdContent || isAdTrigger || isAdDuration || isAdDuration2 || isAd1 || isAd2 || (!!attr.key && customAttributes.hasOwnProperty(attr.key)));
                  
                  let fieldOptions: string[] = [];
                  if (isAdType) fieldOptions = AD_TYPE_OPTIONS;
                  if (isAdPosition) fieldOptions = AD_POSITION_OPTIONS;
                  if (isAdFrequency) fieldOptions = AD_FREQUENCY_OPTIONS;
                  if (isAdContent) fieldOptions = AD_CONTENT_OPTIONS;
                  if (isAdDuration || isAdDuration2) fieldOptions = AD_DURATION_OPTIONS;
                  if (isAdTrigger) fieldOptions = AD_TRIGGER_OPTIONS;

                  const userOptions = customAttributes[attr.key] || [];
                  const allOptions = [...fieldOptions, ...userOptions];
                  const isCustomValue = userOptions.includes(attr.value);
                  const showDropdown = isDropdownField && (attr.value === '' || allOptions.includes(attr.value));

                  return (
                    <div 
                      key={attr.id} 
                      className="flex items-center gap-2 group/attr transition-all"
                      draggable={attrDragEnabled}
                      onDragStart={(e) => handleAttrDragStart(e, index, attrIndex)}
                      onDragEnter={(e) => handleAttrDragEnter(e, index, attrIndex)}
                      onDragEnd={handleAttrDragEnd}
                      onDragOver={handleDragOver}
                    >
                      <div 
                        className="cursor-move text-gray-400 hover:text-blue-500 p-2 rounded -ml-8 w-8 flex justify-center"
                        onMouseEnter={() => setAttrDragEnabled(true)}
                        onMouseLeave={() => setAttrDragEnabled(false)}
                        title="拖动调整属性顺序"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                      </div>

                      <div className="w-1/3 relative">
                        <input
                          type="text"
                          value={attr.key}
                          onChange={(e) => updateAttribute(group.id, attr.id, 'key', e.target.value)}
                          className="w-full text-xs border-gray-300 rounded border py-1 px-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-gray-50"
                          placeholder="属性 (如: 广告类型)"
                        />
                      </div>
                      <div className="w-2/3 relative flex items-center gap-2">
                        
                        {isAdCount ? (
                          // Custom Stepper UI for "出现次数"
                          <div className="flex items-center w-full shadow-sm rounded-md overflow-hidden border border-gray-300 bg-white">
                             <button
                               type="button"
                               onClick={() => handleCountAdjust(group.id, attr.id, attr.value, -1)}
                               className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-blue-600 border-r border-gray-200 transition-colors focus:outline-none active:bg-gray-200"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                             </button>
                             <input
                               type="text"
                               value={attr.value}
                               onChange={(e) => updateAttribute(group.id, attr.id, 'value', e.target.value)}
                               className="flex-grow w-0 text-center text-xs py-1 focus:outline-none focus:bg-blue-50 text-gray-800"
                               placeholder="次数"
                             />
                             <button
                               type="button"
                               onClick={() => handleCountAdjust(group.id, attr.id, attr.value, 1)}
                               className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-blue-600 border-l border-gray-200 transition-colors focus:outline-none active:bg-gray-200"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                             </button>
                          </div>
                        ) : showDropdown ? (
                          <div className="relative flex-grow flex items-center gap-2">
                            <div className="relative flex-grow">
                              <select
                                value={attr.value}
                                onChange={(e) => {
                                  if (e.target.value === 'CUSTOM_TRIGGER') {
                                    updateAttribute(group.id, attr.id, 'value', ' '); 
                                  } else {
                                    updateAttribute(group.id, attr.id, 'value', e.target.value);
                                  }
                                }}
                                className="w-full text-xs border-gray-300 rounded border py-1 px-2 pr-6 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white appearance-none leading-tight"
                              >
                                <option value="" disabled className="text-gray-400">请选择...</option>
                                {fieldOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                
                                {userOptions.length > 0 && <option disabled>── 自定义模板 ──</option>}
                                {userOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                
                                <option disabled>──────────</option>
                                <option value="CUSTOM_TRIGGER" className="text-blue-600 font-medium">✍️ 自定义 / 新增...</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-500">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </div>
                            </div>
                            
                            {isCustomValue && (
                              <button
                                type="button"
                                onClick={() => deleteCustomOption(attr.key, attr.value)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200"
                                title="删除此通用模板"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="relative flex-grow flex items-center gap-2">
                            <div className="relative flex-grow">
                              <input
                                type="text"
                                value={attr.value === ' ' ? '' : attr.value}
                                onChange={(e) => updateAttribute(group.id, attr.id, 'value', e.target.value)}
                                className={`w-full text-xs border-gray-300 rounded border py-1 px-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${isDropdownField ? 'pr-6 bg-blue-50' : ''}`}
                                placeholder={isDropdownField ? "输入自定义内容" : "内容"}
                                autoFocus={isDropdownField && attr.value === ' '}
                              />
                              {isDropdownField && (
                                <button
                                  type="button"
                                  onClick={() => updateAttribute(group.id, attr.id, 'value', '')}
                                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                                  title="清除并返回选项"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              )}
                            </div>

                            {isDropdownField && attr.value && attr.value.trim() !== '' && !allOptions.includes(attr.value) && (
                              <button
                                type="button"
                                onClick={() => saveCustomOption(attr.key, attr.value)}
                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 bg-white shadow-sm"
                                title="保存为通用模板 (以后可直接选择)"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeAttribute(group.id, attr.id)}
                          className="text-gray-300 hover:text-red-400 flex-shrink-0 p-1"
                          title="删除此属性"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pl-8">
                <button
                  type="button"
                  onClick={() => addAttribute(group.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  添加子模块 (属性)
                </button>
              </div>
            </div>
          ))}
          
          {adGroups.length === 0 && (
             <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm">
                暂无广告模块，请点击上方按钮添加
             </div>
          )}
          
          <button
            type="button"
            onClick={addGroup}
            className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 font-medium hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            添加新的广告大模块
          </button>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">详细反馈与备注</label>
          <div className="mt-1">
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="记录其他试玩感受..."
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out"
          >
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;