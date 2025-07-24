import { ConfirmDialog } from "primereact/confirmdialog";
import { confirmDialog } from "primereact/confirmdialog";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "primereact/button";
import { BsPrinter } from "react-icons/bs";
import { useDeleteOrderMutation } from "../../../provider/queries/Orders.query";
import ShowAndPrintModel from "./ShowAndPrint.model";

const TableCard = ({ data, id }: any) => {
  const [DeleteConsumer, DeleteConsumerResponse] = useDeleteOrderMutation();
  const [visible, setVisible] = useState(false);

  const confirmDelete = (_id: string) => {
    confirmDialog({
      message: "Are you sure you want to delete this order?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",
      acceptClassName: "p-button-danger",
      accept: () => deleteHandler(_id),
    });
  };

  const deleteHandler = async (_id: string) => {
    try {
      const { data, error }: any = await DeleteConsumer(_id);
      if (error) {
        toast.error(error.data.message || "Failed to delete order");
        return;
      }
      toast.success(data.msg || "Order deleted successfully");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    }
  };

  return (
    <>
      <tr className="bg-white border-b hover:bg-gray-50 transition-all">
        <td className="px-6 py-4 font-medium text-gray-900">{id}</td>
        <td className="px-6 py-4">{data?.consumer?.name || "N/A"}</td>
        <td className="px-6 py-4">{data?.consumer?.email || "N/A"}</td>
        <td className="px-6 py-4">
          {data?.items?.length > 0 ? (
            <ul className="list-disc list-inside text-sm">
              {data.items.map((item: any, i: number) => (
                <li key={i}>
                  {item.name} — ₹{item.price} × Qty: {item.quantity}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-400 italic">No items</span>
          )}
        </td>
        <td className="px-6 py-4 flex flex-row gap-2">
          <Button
            icon={<BsPrinter className="text-lg" />}
            className="bg-teal-500 text-white p-2"
            tooltip="View & Print"
            onClick={() => setVisible(true)}
          />
          <Button
            icon={<FaRegTrashAlt className="text-lg" />}
            className="bg-red-500 text-white p-2"
            tooltip="Delete"
            loading={DeleteConsumerResponse.isLoading}
            onClick={() => confirmDelete(data._id)}
          />
        </td>
      </tr>

      <ShowAndPrintModel
        id={data._id}
        visible={visible}
        setVisible={setVisible}
      />
    </>
  );
};

export default TableCard;
