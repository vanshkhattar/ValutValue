// OrdersPage.tsx
import { FormEvent, useState } from "react";
import BredCrums from "../../components/BredCrums";
import Loader from "../../components/Loader";
import { BsArrowRightCircle, BsArrowLeftCircle } from "react-icons/bs";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddOrderModel from "./components/AddOrder.model";
import ShowAndPrintModel from "./components/ShowAndPrint.model";
import { useGetAllOrdersQuery } from "../../provider/queries/Orders.query";
import TableCard from "./components/Card.order";
import { ConfirmDialog } from "primereact/confirmdialog";

const OrdersPage = () => {
  const [addVisible, setAddVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const navigate = useNavigate();
  const [SearchParams] = useSearchParams();
  const [Search, setSearch] = useState(SearchParams.get("query") || "");

  const { data, isLoading, isError, refetch } = useGetAllOrdersQuery({
    query: SearchParams.get("query") || "",
    page: SearchParams.get("page") || 1,
  });

  if (isLoading) return <Loader />;
  if (isError) return <h1>Something went wrong</h1>;

  const SearchHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/orders?query=${Search}&page=1`);
  };

  const OnNextPageHandler = () => {
    const page = Number(SearchParams.get("page")) || 1;
    const query = SearchParams.get("query") || "";
    navigate(`/orders?query=${query}&page=${page + 1}`);
  };

  const onPrevPageHandler = () => {
    const page = Number(SearchParams.get("page")) || 1;
    const query = SearchParams.get("query") || "";
    navigate(`/orders?query=${query}&page=${page - 1}`);
  };

  return (
    <>
      <BredCrums PageLink="/orders" PageName="Orders" />

      <div className="mb-3 flex justify-end w-[90%] mx-auto">
        <button
          onClick={() => setAddVisible(true)}
          className="px-5 py-2 bg-purple-500 text-white rounded-sm"
        >
          Add Orders
        </button>
      </div>

      <form
        onSubmit={SearchHandler}
        className="mb-3 flex justify-end w-[90%] mx-auto"
      >
        <input
          value={Search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[90%] mx-auto lg:mx-0 lg:w-1/2 rounded-sm border py-3 px-5 outline-none"
          placeholder="Search Orders"
        />
      </form>

      <div
        className={`mb-3 flex ${
          (Number(SearchParams.get("page")) || 1) > 1
            ? "justify-between"
            : "justify-end"
        } w-[90%] mx-auto`}
      >
        {(Number(SearchParams.get("page")) || 1) > 1 && (
          <button
            onClick={onPrevPageHandler}
            title="Prev Page"
            className="text-black text-xl lg:text-3xl p-2"
          >
            <BsArrowLeftCircle />
          </button>
        )}
        {data?.hasMore && (
          <button
            onClick={OnNextPageHandler}
            title="Next Page"
            className="text-black text-xl lg:text-3xl p-2"
          >
            <BsArrowRightCircle />
          </button>
        )}
      </div>

      <div className="relative overflow-x-auto shadow">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((c: any, i: number) => (
                <TableCard
                  key={i}
                  id={i + 1}
                  data={c}
                  onPrintClick={(id: string) => {
                    setSelectedOrderId(id);
                    setVisible(true);
                  }}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrderId && (
        <ShowAndPrintModel
          id={selectedOrderId}
          visible={visible}
          setVisible={setVisible}
        />
      )}

      <AddOrderModel visible={addVisible} setVisible={setAddVisible} />
      <ConfirmDialog />
    </>
  );
};

export default OrdersPage;
