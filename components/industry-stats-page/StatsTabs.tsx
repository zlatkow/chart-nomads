import { BarChart2, FileText, DollarSign } from 'lucide-react';

interface StatsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const StatsTabs = ({ activeTab, onTabChange }: StatsTabsProps) => {
  return (
    <div className="w-auto mb-8 bg-[#0f0f0f] rounded-md overflow-hidden">
      <div className="flex">
        <button
          onClick={() => onTabChange("stats")}
          className={`flex items-center px-6 py-3 text-sm font-medium ${
            activeTab === "stats"
              ? "bg-[#FFB800] text-black"
              : "bg-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          Stats
        </button>
        <button
          onClick={() => onTabChange("transactions")}
          className={`flex items-center px-6 py-3 text-sm font-medium ${
            activeTab === "transactions"
              ? "bg-[#FFB800] text-black"
              : "bg-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Transactions
        </button>
        <button
          onClick={() => onTabChange("high-earners")}
          className={`flex items-center px-6 py-3 text-sm font-medium ${
            activeTab === "high-earners"
              ? "bg-[#FFB800] text-black"
              : "bg-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          High Earners
        </button>
      </div>
    </div>
  );
};

export default StatsTabs;
