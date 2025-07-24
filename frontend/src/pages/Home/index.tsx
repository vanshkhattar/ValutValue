import BasicChart from "./components/Basic";
import PieChartDemo from "./components/Pie";

const HomePage = () => {
  return (
    // Outer container for the entire page, providing padding and a background
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4 md:p-6 lg:p-8">
      {/* Title for the dashboard/home page */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8">
        📊 Dashboard Overview
      </h1>

      {/*
        Flex container for the charts:
        - `flex`: Enables flexbox
        - `flex-col`: Stacks items vertically by default (for small screens)
        - `lg:flex-row`: On large screens and up, arrange items horizontally
        - `lg:items-start`: Align items to the start (top) when in a row
        - `lg:space-x-8`: Add horizontal space between items on large screens
        - `space-y-8 lg:space-y-0`: Add vertical space between items on small/medium screens,
                                     remove vertical space when horizontal on large screens
      */}
      <div className="w-full flex flex-col lg:flex-row lg:items-start lg:space-x-8 space-y-8 lg:space-y-0 max-w-7xl mx-auto">
        {/*
          BasicChart Container:
          - `w-full`: Takes full width on small screens
          - `lg:w-1/2`: Takes half width on large screens
          - `flex-shrink-0`: Prevents shrinking
          - `rounded-lg shadow-xl bg-white p-6`: Basic card styling
        */}
        <div className="w-full lg:w-1/2 flex-shrink-0 rounded-lg shadow-xl bg-white p-6 border border-gray-200 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Basic Metrics Chart</h2>
          <BasicChart />
        </div>

        {/*
          PieChartDemo Container:
          - `w-full`: Takes full width on small screens
          - `lg:w-1/2`: Takes half width on large screens
          - `flex-shrink-0`: Prevents shrinking
          - `rounded-lg shadow-xl bg-white p-6`: Basic card styling
        */}
        <div className="w-full lg:w-1/2 flex-shrink-0 rounded-lg shadow-xl bg-white p-6 border border-gray-200 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Distribution Overview</h2>
          <PieChartDemo />
        </div>
      </div>
    </div>
  );
};

export default HomePage;