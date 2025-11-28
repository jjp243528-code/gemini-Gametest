import React, { useState, useEffect } from 'react';
// @ts-ignore
import XLSX from 'xlsx-js-style';
import Header from './components/Header';
import EntryForm from './components/EntryForm';
import EntryList from './components/EntryList';
import CustomAttributeManager from './components/CustomAttributeManager';
import SettingsModal from './components/SettingsModal';
import { GameEntry, CustomAttributeMap, AppSettings } from './types';

function App() {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [formInitialData, setFormInitialData] = useState<GameEntry | null>(null);
  
  // Custom Attributes State
  const [customAttributes, setCustomAttributes] = useState<CustomAttributeMap>({});
  const [isAttributeManagerOpen, setIsAttributeManagerOpen] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    enableAutoSave: true,
    exportFileName: '游戏广告测评'
  });

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Custom Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'all', id?: string } | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  // Load from local storage
  useEffect(() => {
    // Load game entries
    const savedEntries = localStorage.getItem('gameAdEntries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (e) {
        console.error("Failed to parse saved entries", e);
      }
    }
    // Load custom attributes
    const savedAttributes = localStorage.getItem('adCustomOptions');
    if (savedAttributes) {
       try {
        setCustomAttributes(JSON.parse(savedAttributes));
      } catch (e) {
        console.error("Failed to parse custom attributes", e);
      }
    }
    // Load app settings
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAppSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('gameAdEntries', JSON.stringify(entries));
  }, [entries]);

  const handleUpdateCustomAttributes = (newAttributes: CustomAttributeMap) => {
    setCustomAttributes(newAttributes);
    localStorage.setItem('adCustomOptions', JSON.stringify(newAttributes));
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  const handleAddEntry = (entry: GameEntry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget({ type: 'single', id });
  };
  
  const handleClearAllRequest = () => {
    if (entries.length === 0) return;
    setDeleteTarget({ type: 'all' });
  };

  const confirmDelete = () => {
    if (deleteTarget?.type === 'single' && deleteTarget.id) {
      const idToDelete = deleteTarget.id;
      setEntries(prev => prev.filter(e => e.id !== idToDelete));
      setSelectedIds(prev => prev.filter(id => id !== idToDelete));
    } else if (deleteTarget?.type === 'all') {
      setEntries([]);
      setSelectedIds([]);
    }
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleCopyEntry = (entry: GameEntry) => {
    setFormInitialData(entry);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map(e => e.id));
    }
  };

  const handleBackupData = () => {
    try {
      const backup = {
        entries,
        customAttributes,
        appSettings,
        version: '1.0',
        timestamp: Date.now()
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GameAdInsight_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("备份失败");
    }
  };

  const handleRestoreData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          const data = JSON.parse(e.target.result as string);
          if (data.entries && Array.isArray(data.entries)) {
            if (window.confirm(`确认恢复数据？这将覆盖当前所有记录。\n文件中包含 ${data.entries.length} 条记录。`)) {
              setEntries(data.entries);
              if (data.customAttributes) handleUpdateCustomAttributes(data.customAttributes);
              if (data.appSettings) handleUpdateSettings(data.appSettings);
              alert("数据恢复成功！");
              setIsSettingsOpen(false);
            }
          } else {
            alert("无效的备份文件格式");
          }
        }
      } catch (err) {
        console.error(err);
        alert("文件解析失败");
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    // 1. Determine which entries to export
    const entriesToExport = selectedIds.length > 0 
      ? entries.filter(e => selectedIds.includes(e.id))
      : entries;

    if (entriesToExport.length === 0) {
      alert('暂无数据可导出');
      return;
    }

    try {
      // 2. Discover ALL dynamic attribute keys from the data
      const allAttributeKeys = new Set<string>();
      
      // We define a preferred order for common fields to keep the Excel readable
      const preferredOrder = [
        '广告位置', 
        '出现频率', 
        '出现次数', 
        '广告一', 
        '广告类型一', 
        '时长', 
        '广告二', 
        '广告类型二', 
        '时长二', 
        '触发关卡', 
        '触发事件'
      ];

      // Scan data for all used keys
      entriesToExport.forEach(entry => {
        entry.adGroups.forEach(group => {
          group.attributes.forEach(attr => {
            if (attr.key && attr.key.trim() !== '') {
              allAttributeKeys.add(attr.key.trim());
            }
          });
        });
      });

      // Sort keys based on preferred order + alphabetical for new ones
      const sortedDynamicKeys = Array.from(allAttributeKeys).sort((a, b) => {
        const idxA = preferredOrder.indexOf(a);
        const idxB = preferredOrder.indexOf(b);
        
        // If both are in preferred list, sort by index
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        // If only A is in preferred list, A comes first
        if (idxA !== -1) return -1;
        // If only B is in preferred list, B comes first
        if (idxB !== -1) return 1;
        // If neither, sort alphabetically
        return a.localeCompare(b);
      });

      // Map internal keys to display headers (optional renaming)
      const keyToHeaderMap: Record<string, string> = {
        '时长': '广告一时长',
        '时长二': '广告二时长'
      };

      const dynamicHeaderLabels = sortedDynamicKeys.map(k => keyToHeaderMap[k] || k);

      // 3. Construct Final Headers
      const headers = [
        '游戏名称', 
        '游戏类型', 
        '试玩时长', 
        '游戏时间/节点', 
        ...dynamicHeaderLabels, 
        '试玩反馈'
      ];

      // 4. Build Data Rows dynamically
      const dataRows: any[][] = [];

      entriesToExport.forEach(e => {
        // If no ad groups, push a single row with basic info
        if (!e.adGroups || e.adGroups.length === 0) {
          const row = [
            e.gameName,
            e.genre,
            e.duration || '',
            '', // No Game Time
            ...sortedDynamicKeys.map(() => ''), // Empty dynamic cols
            e.notes
          ];
          dataRows.push(row);
          return;
        }

        // Create a row for each ad group
        e.adGroups.forEach((g, index) => {
          const row = [
            index === 0 ? e.gameName : '', 
            index === 0 ? e.genre : '',
            index === 0 ? (e.duration || '') : '',
            g.gameTime || '',
            // Map values for each dynamic key
            ...sortedDynamicKeys.map(key => {
               const attr = g.attributes.find(a => a.key === key);
               return attr ? attr.value : '';
            }),
            index === 0 ? e.notes : ''
          ];
          
          dataRows.push(row);
        });
      });

      // 5. Create Sheet
      const wsData = [headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // 6. Apply Styles
      const headerStyle = {
        font: { name: 'SimSun', sz: 11, bold: true, color: { rgb: "FFFFFF" } }, 
        fill: { fgColor: { rgb: "4472C4" } }, 
        alignment: { horizontal: 'center', vertical: 'center' },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };

      const contentStyle = {
        font: { name: 'SimSun', sz: 10, bold: false },
        alignment: { vertical: 'center', wrapText: true },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };

      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cell_address]) continue;
            ws[cell_address].s = R === 0 ? headerStyle : contentStyle;
          }
        }
      }

      // 7. Dynamic Column Widths
      const colWidths = [
        { wpx: 120 }, // Game Name
        { wpx: 80 },  // Genre
        { wpx: 80 },  // Duration
        { wpx: 120 }, // Game Time
        ...sortedDynamicKeys.map(() => ({ wpx: 110 })), // Dynamic cols approx width
        { wpx: 200 }  // Notes
      ];
      ws['!cols'] = colWidths;

      // 8. Write File
      // Use configured prefix or default
      const prefix = appSettings.exportFileName.trim() || '游戏广告测评';
      const filename = selectedIds.length > 0 
        ? `${prefix}_选中${selectedIds.length}条_${new Date().toISOString().slice(0, 10)}.xlsx`
        : `${prefix}_全部_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "广告测评数据");
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Export failed", error);
      alert('导出失败，请检查数据完整性。');
    }
  };

  const isAllSelected = entries.length > 0 && selectedIds.length === entries.length;

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <Header 
        entryCount={entries.length} 
        onExport={handleExport} 
        onInstall={handleInstallApp}
        canInstall={!!deferredPrompt}
        onOpenAttributeManager={() => setIsAttributeManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        selectedCount={selectedIds.length}
      />
      
      {/* Main Container - Independent Scrolling Logic */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 overflow-y-auto lg:overflow-hidden min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-full">
          
          {/* Left Column: Form (Scrolls independently on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
             <div className="space-y-6 pb-6">
                <EntryForm 
                  onAddEntry={handleAddEntry} 
                  initialData={formInitialData}
                  onClearInitialData={() => setFormInitialData(null)}
                  customAttributes={customAttributes}
                  onUpdateCustomAttributes={handleUpdateCustomAttributes}
                  enableAutoSave={appSettings.enableAutoSave}
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">使用小贴士</h4>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                    <li>推荐使用电脑端访问，获得最佳的左右分屏体验。</li>
                    <li>点击 "添加策略组" 记录不同阶段的广告逻辑。</li>
                    <li>所有数据均存储在本地浏览器缓存中。</li>
                  </ul>
                </div>
             </div>
          </div>

          {/* Right Column: List (Scrolls independently on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar flex flex-col">
            <div className="flex-none mb-4 sticky top-0 bg-gray-100 z-10 pt-1 pb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   {entries.length > 0 && (
                     <div className="flex items-center select-none">
                       <input
                         id="select-all"
                         type="checkbox"
                         checked={isAllSelected}
                         onChange={handleSelectAll}
                         className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                       />
                       <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                          全选
                       </label>
                     </div>
                   )}
                   <h2 className="text-lg font-medium text-gray-900">记录列表</h2>
                   <span className="text-sm text-gray-500 hidden sm:inline">({entries.length} 条)</span>
                </div>
                
                {entries.length > 0 && (
                  <button 
                    onClick={handleClearAllRequest}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center px-2 py-1 hover:bg-red-50 rounded transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    清空所有
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-grow pb-6">
              <EntryList 
                entries={entries} 
                onDelete={handleDeleteRequest} 
                onCopy={handleCopyEntry}
                selectedIds={selectedIds}
                onToggleSelection={handleToggleSelection}
              />
            </div>
          </div>

        </div>
      </main>
      
      {/* Modals */}
      <CustomAttributeManager
        isOpen={isAttributeManagerOpen}
        onClose={() => setIsAttributeManagerOpen(false)}
        attributes={customAttributes}
        onUpdate={handleUpdateCustomAttributes}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        onUpdateSettings={handleUpdateSettings}
        onBackupData={handleBackupData}
        onRestoreData={handleRestoreData}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={cancelDelete}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {deleteTarget.type === 'all' ? '清空所有记录' : '删除记录'}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {deleteTarget.type === 'all' 
                        ? '确定要清空所有已保存的试玩数据吗？此操作无法撤销。'
                        : '确定要删除这条试玩记录吗？此操作无法撤销。'
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  确定删除
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;