import { FaBoxOpen, FaArrowDown, FaDollarSign, FaThLarge } from "react-icons/fa";

const InventoryStats = ({ totalItems, lowStock, totalValue, categories }: {
  totalItems: number;
  lowStock: number;
  totalValue: number;
  categories: number;
}) => {
  const stats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: <FaBoxOpen className="text-blue-600 text-xl" />,
    },
    {
      label: "Low Stock",
      value: lowStock,
      icon: <FaArrowDown className="text-red-500 text-xl" />,
    },
    {
      label: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: <FaDollarSign className="text-green-600 text-xl" />,
    },
    {
      label: "Categories",
      value: categories,
      icon: <FaThLarge className="text-purple-600 text-xl" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white p-5 shadow rounded-xl border flex items-center justify-between"
        >
          <div>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-full">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;
