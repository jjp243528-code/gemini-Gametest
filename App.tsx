import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EntryForm from './components/EntryForm';
import EntryList from './components/EntryList';
import CustomAttributeManager from './components/CustomAttributeManager';
import { GameEntry, CustomAttributeMap } from './types';

function App() {
  const [entries, setEntries] = useState<GameEntry[]>([]);
  const [formInitialData, setFormInitialData] = useState<GameEntry | null>(null);
  
  // Custom Attributes State
  const [customAttributes, setCustomAttributes] = useState<CustomAttributeMap>({});
  const [isAttributeManagerOpen, setIsAttributeManagerOpen] = useState(false);

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
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('gameAdEntries', JSON.stringify(entries));
  }, [entries]);

  const handleUpdateCustomAttributes = (newAttributes: CustomAttributeMap) => {
    setCustomAttributes(newAttributes);
    localStorage.setItem('adCustomOptions', JSON.stringify(newAttributes));
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
      setEntries(prev => prev.filter(e => e.id !== deleteTarget.id));
    } else if (deleteTarget?.type === 'all') {
      setEntries([]);
    }
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleCopyEntry = (entry: GameEntry) => {
    setFormInitialData(entry);
  };

  const handleExport = () => {
    if (entries.length === 0) {
      alert('暂无数据可导出');
      return;
    }

    try {
      // 1. Prepare data for Excel: Flatten structure so each Ad Group is a row
      const exportData = entries.flatMap(e => {
        // Handle entries with no ad groups
        if (!e.adGroups || e.adGroups.length === 0) {
          return [{
            '记录日期': e.date,
            '游戏名称': e.gameName,
            '游戏类型': e.genre,
            '试玩时长': e.duration || '',
            '广告模块': '',
            '游戏时间/节点': '',
            '试玩反馈': e.notes
          }];
        }

        // Map each ad group to a separate row
        return e.adGroups.map((g, index) => {
          const isFirst = index === 0;
          
          const row: Record<string, string> = {
            '记录日期': isFirst ? e.date : '',
            '游戏名称': isFirst ? e.gameName : '',
            '游戏类型': isFirst ? e.genre : '',
            '试玩时长': isFirst ? (e.duration || '') : '',
            '广告模块': g.name || '',
            '游戏时间/节点': g.gameTime || '',
          };

          g.attributes.forEach(attr => {
            if (attr.key && attr.key.trim()) {
              row[attr.key] = attr.value;
            }
          });

          row['试玩反馈'] = isFirst ? e.notes : '';

          return row;
        });
      });

      const ws = window.XLSX.utils.json_to_sheet(exportData);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "广告测评数据");
      window.XLSX.writeFile(wb, `游戏广告测评表_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Export failed", error);
      alert('导出失败，请确保网络正常以加载导出组件。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <Header 
        entryCount={entries.length} 
        onExport={handleExport} 
        onInstall={handleInstallApp}
        canInstall={!!deferredPrompt}
        onOpenAttributeManager={() => setIsAttributeManagerOpen(true)}
      />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
             <div className="sticky top-24">
                <EntryForm 
                  onAddEntry={handleAddEntry} 
                  initialData={formInitialData}
                  onClearInitialData={() => setFormInitialData(null)}
                  customAttributes={customAttributes}
                  onUpdateCustomAttributes={handleUpdateCustomAttributes}
                />
                
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">岗位职责提示</h4>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                    <li>下载并试玩指定的海外小游戏。</li>
                    <li>使用计时器记录准确的试玩或广告时长。</li>
                    <li>点击 "添加策略组" 来记录不同的广告形态。</li>
                    <li>使用 "游戏时间" 标记广告触发的关卡或时间点。</li>
                    <li>数据将自动保存在您的浏览器缓存中。</li>
                  </ul>
                </div>
             </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <h2 className="text-lg font-medium text-gray-900">记录列表</h2>
                 <span className="text-sm text-gray-500 hidden sm:inline">数据保存在本地浏览器</span>
              </div>
              
              {entries.length > 0 && (
                <button 
                  onClick={handleClearAllRequest}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center px-2 py-1 hover:bg-red-50 rounded"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  清空所有记录
                </button>
              )}
            </div>
            <EntryList 
              entries={entries} 
              onDelete={handleDeleteRequest} 
              onCopy={handleCopyEntry}
            />
          </div>

        </div>
      </main>
      
      {/* Custom Attribute Manager Modal */}
      <CustomAttributeManager
        isOpen={isAttributeManagerOpen}
        onClose={() => setIsAttributeManagerOpen(false)}
        attributes={customAttributes}
        onUpdate={handleUpdateCustomAttributes}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={cancelDelete}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  确定删除
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
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