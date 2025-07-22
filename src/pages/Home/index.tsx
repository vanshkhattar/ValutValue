import BasicChart from "./components/Basic";
import PieChartDemo from "./components/Pie";
import InventoryStats from "./components/InventoryStats";

const HomePage = () => {
  const statsData = {
    totalItems: 20,
    lowStock: 12,
    totalValue: 1678,
    categories: 15,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4 md:p-6 lg:p-8">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-6">
        Dashboard Overview
      </h1>

      {/* 📊 Inventory Summary Cards */}
      <div className="max-w-7xl mx-auto">
        <InventoryStats {...statsData} />
      </div>

      {/* Charts Section */}
      <div className="w-full flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-8 lg:space-y-0 max-w-7xl mx-auto mt-10">
        {/* 📈 Basic Line/Bar Chart */}
        <div className="w-full lg:w-1/2 flex-shrink-0 rounded-lg shadow-xl bg-white p-6 border border-gray-200 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Basic Metrics Chart</h2>
          <BasicChart />
        </div>

        {/* 🥧 Pie Chart */}
        <div className="w-full lg:w-1/2 flex-shrink-0 rounded-lg shadow-xl bg-white p-6 border border-gray-200 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Distribution Overview</h2>
          <PieChartDemo />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
