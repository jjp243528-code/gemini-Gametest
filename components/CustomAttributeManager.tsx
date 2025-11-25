import React, { useState, useEffect } from 'react';
import { CustomAttributeMap } from '../types';

interface CustomAttributeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  attributes: CustomAttributeMap;
  onUpdate: (newAttributes: CustomAttributeMap) => void;
}

const CustomAttributeManager: React.FC<CustomAttributeManagerProps> = ({ isOpen, onClose, attributes, onUpdate }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Reset selected key if it's deleted
  useEffect(() => {
    if (selectedKey && !attributes.hasOwnProperty(selectedKey)) {
      setSelectedKey(null);
    }
    // If there's no selection but there are keys, select the first one
    if (!selectedKey && Object.keys(attributes).length > 0) {
      setSelectedKey(Object.keys(attributes)[0]);
    }
  }, [attributes, selectedKey]);

  if (!isOpen) {
    return null;
  }

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = newKey.trim();
    if (trimmedKey && !attributes.hasOwnProperty(trimmedKey)) {
      onUpdate({ ...attributes, [trimmedKey]: [] });
      setNewKey('');
      setSelectedKey(trimmedKey);
    }
  };
  
  const handleDeleteKey = (keyToDelete: string) => {
    const { [keyToDelete]: _, ...rest } = attributes;
    onUpdate(rest);
  };

  const handleAddValue = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = newValue.trim();
    if (trimmedValue && selectedKey) {
      const currentValues = attributes[selectedKey] || [];
      if (!currentValues.includes(trimmedValue)) {
        onUpdate({
          ...attributes,
          [selectedKey]: [...currentValues, trimmedValue],
        });
        setNewValue('');
      }
    }
  };
  
  const handleDeleteValue = (valueToDelete: string) => {
    if (selectedKey) {
      const updatedValues = (attributes[selectedKey] || []).filter(v => v !== valueToDelete);
      onUpdate({
        ...attributes,
        [selectedKey]: updatedValues,
      });
    }
  };

  const sortedKeys = Object.keys(attributes).sort();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all my-8 align-middle max-w-4xl w-full">
          <div className="bg-white px-6 pt-5 pb-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">管理自定义模板</h3>
                        <p className="text-sm text-gray-500">在这里添加、删除可复用的属性和选项。</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
              {/* Left Panel: Keys */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col">
                <h4 className="text-sm font-semibold text-gray-800 border-b pb-2 mb-2">属性 (Keys)</h4>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                  {sortedKeys.length > 0 ? (
                    <ul className="space-y-1">
                      {sortedKeys.map(key => (
                        <li key={key} onClick={() => setSelectedKey(key)}
                            className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors text-sm ${selectedKey === key ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-200 text-gray-700'}`}>
                          <span>{key}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteKey(key); }}
                                  className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100" title={`删除 '${key}'`}>
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-gray-500 text-center py-4">暂无自定义属性</p>}
                </div>
                <form onSubmit={handleAddKey} className="mt-4 pt-4 border-t flex gap-2">
                  <input type="text" value={newKey} onChange={e => setNewKey(e.target.value)}
                         className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                         placeholder="添加新属性..." />
                  <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">添加</button>
                </form>
              </div>

              {/* Right Panel: Values */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col">
                 <h4 className="text-sm font-semibold text-gray-800 border-b pb-2 mb-2">
                    {selectedKey ? `选项 for "${selectedKey}"` : '请选择一个属性'}
                </h4>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                   {selectedKey && attributes[selectedKey] && attributes[selectedKey].length > 0 ? (
                    <ul className="space-y-1">
                      {attributes[selectedKey].map(value => (
                         <li key={value} className="group flex justify-between items-center p-2 rounded-md bg-white text-sm text-gray-800 border">
                           <span>{value}</span>
                           <button onClick={() => handleDeleteValue(value)}
                                   className="p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100" title={`删除 '${value}'`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <p className="text-xs text-gray-500 text-center py-4">{selectedKey ? '暂无选项' : ''}</p>
                   )}
                </div>
                 {selectedKey && (
                    <form onSubmit={handleAddValue} className="mt-4 pt-4 border-t flex gap-2">
                      <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)}
                             className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 border"
                             placeholder="添加新选项..." />
                      <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">添加</button>
                    </form>
                 )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAttributeManager;
