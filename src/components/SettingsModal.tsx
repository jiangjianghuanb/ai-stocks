import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    refreshInterval: number;
    maxStocks: number;
  };
  onSettingsChange: (newSettings: { refreshInterval: number; maxStocks: number }) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSettingsChange(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">设置</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="refreshInterval" className="block mb-2">刷新间隔（分钟）</label>
            <input
              type="number"
              id="refreshInterval"
              name="refreshInterval"
              value={localSettings.refreshInterval}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="maxStocks" className="block mb-2">最大显示股票数量</label>
            <input
              type="number"
              id="maxStocks"
              name="maxStocks"
              value={localSettings.maxStocks}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded">取消</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;