'use client';

interface TabsNavigationProps {
  activeTab: 'data' | 'rules';
  onTabChange: (tab: 'data' | 'rules') => void;
}

export function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  return (
    <div className="mb-6 flex border-b">
      <button
        onClick={() => onTabChange('data')}
        className={`px-4 py-2 font-medium ${
          activeTab === 'data' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Data View
      </button>
      <button
        onClick={() => onTabChange('rules')}
        className={`px-4 py-2 font-medium ${
          activeTab === 'rules' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Rule Builder
      </button>
    </div>
  );
}
