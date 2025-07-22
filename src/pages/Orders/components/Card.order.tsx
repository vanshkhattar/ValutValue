// TableCard.tsx
import { confirmDialog } from "primereact/confirmdialog";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "primereact/button";
import { BsPrinter } from "react-icons/bs";
import { useDeleteOrderMutation } from "../../../provider/queries/Orders.query";

const TableCard = ({ data, id, onPrintClick }: any) => {
  const [deleteOrder, deleteResponse] = useDeleteOrderMutation();

  const confirmDelete = () => {
    confirmDialog({
      message: "Are you sure you want to delete this order?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Yes",
      rejectLabel: "No",
      accept: () => deleteHandler(data._id),
    });
  };

  const deleteHandler = async (_id: string) => {
    try {
      const res: any = await deleteOrder(_id);
      if (res?.error) {
        toast.error(res.error.data?.message || "Delete failed");
        return;
      }
      toast.success(res.data?.msg || "Order deleted successfully");
    } catch (e: any) {
      toast.error("Error deleting order");
    }
  };

  return (
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
          onClick={() => onPrintClick(data._id)}
        />
        <Button
          icon={<FaRegTrashAlt className="text-lg" />}
          className="bg-red-500 text-white p-2"
          tooltip="Delete"
          loading={deleteResponse.isLoading}
          onClick={confirmDelete}
        />
      </td>
    </tr>
  );
};

export default TableCard;
