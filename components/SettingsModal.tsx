import React, { useRef } from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onBackupData: () => void;
  onRestoreData: (file: File) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, settings, onUpdateSettings, onBackupData, onRestoreData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onRestoreData(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="bg-white rounded-lg shadow-xl transform transition-all w-full max-w-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              系统设置
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Auto Save Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-1">保存偏好</h4>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <span className="text-sm font-medium text-gray-900 block">表单自动保存</span>
                  <span className="text-xs text-gray-500 mt-1 block">开启后，编辑内容将实时保存到缓存，防止意外关闭导致数据丢失。</span>
                </div>
                <button 
                  onClick={() => onUpdateSettings({...settings, enableAutoSave: !settings.enableAutoSave})}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${settings.enableAutoSave ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${settings.enableAutoSave ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Excel Export Path (Filename) */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-1">Excel 导出设置</h4>
              <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">导出文件名 (默认前缀)</label>
                 <div className="flex rounded-md shadow-sm">
                   <input
                     type="text"
                     value={settings.exportFileName}
                     onChange={(e) => onUpdateSettings({...settings, exportFileName: e.target.value})}
                     className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     placeholder="例如: 游戏测评数据"
                   />
                   <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-100 text-gray-500 sm:text-sm">
                     _日期.xlsx
                   </span>
                 </div>
                 <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                   注：受浏览器安全机制限制，网页应用无法直接指定保存到某个硬盘文件夹（如 D:/Data）。<br/>
                   文件将默认下载到您的浏览器 <strong>“下载”</strong> 文件夹中。您可以通过修改此设置来统一下载文件的命名格式。
                 </p>
              </div>
            </div>

             {/* System Data */}
             <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-1">数据备份与恢复 (主动保存)</h4>
              <p className="text-xs text-gray-500 mb-3">您可以将当前所有记录打包导出，或者导入之前的备份文件。</p>
              <div className="grid grid-cols-2 gap-4">
                 <button
                   onClick={onBackupData}
                   className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 focus:outline-none transition-colors"
                 >
                   <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   备份所有数据
                 </button>
                 <button
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-green-600 focus:outline-none transition-colors"
                 >
                   <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m-4 4v12" /></svg>
                   恢复数据文件
                 </button>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileChange} 
                   className="hidden" 
                   accept=".json" 
                 />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              完成并关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;