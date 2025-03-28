import React from 'react';
import { FilterState } from '../ProductFilter/ProductFilter';

const operatingSystems = [
  { id: 'ios', name: 'iOS', icon: '/icons/ios.svg' },
  { id: 'android', name: 'Android', icon: '/icons/android.svg' },
  { id: 'harmonyos', name: 'HarmonyOS', icon: '/icons/harmony.svg' },
  { id: 'windows', name: 'Windows', icon: '/icons/windows.svg' },
  { id: 'macos', name: 'macOS', icon: '/icons/macos.svg' },
];

interface OperatingSystemFilterProps {
  currentFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const OperatingSystemFilter: React.FC<OperatingSystemFilterProps> = ({
  currentFilters,
  onFilterChange,
}) => {
  const handleOsChange = (selectedOs: string) => {
    const newOs = currentFilters.os.includes(selectedOs)
      ? currentFilters.os.filter(item => item !== selectedOs)
      : [...currentFilters.os, selectedOs];

    onFilterChange({
      ...currentFilters,
      os: newOs
    });
  };

  return (
    <div className="border-b pb-6">
      <h3 className="mb-4 text-sm font-medium text-white">Hệ điều hành</h3>
      <div className="grid grid-cols-2 gap-2">
        {operatingSystems.map((os) => (
          <button
            key={os.id}
            onClick={() => handleOsChange(os.name)}
            className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
              currentFilters.os.includes(os.name)
                ? 'border-red-500 bg-red-50 text-red-500'
                : 'border-gray-200 hover:border-gray-300 text-white'
            }`}
          >
            <img src={os.icon} alt={os.name} className="h-5 w-5" />
            <span className="text-sm">{os.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OperatingSystemFilter; 