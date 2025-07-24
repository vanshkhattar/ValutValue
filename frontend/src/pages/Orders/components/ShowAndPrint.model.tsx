import { Dialog } from 'primereact/dialog';
import { useGetInvoiceByIdQuery } from '../../../provider/queries/Orders.query';
import Loader from '../../../components/Loader';
import moment from 'moment';
import Barcode from 'react-barcode';
import { usePDF } from 'react-to-pdf';
import { Button } from 'primereact/button';

const ShowAndPrintModel = ({ setVisible, visible, id }: any) => {
  const { data, isLoading, isError, isFetching } = useGetInvoiceByIdQuery(id);
  const { toPDF, targetRef } = usePDF();

  if (isFetching || isLoading) return <Loader />;
  if (isError || !data) return <>Something went wrong while loading invoice.</>;

  type OrderDoc = {
    name: string;
    id: string;
    price: number;
    quantity: number;
  };

  const totalAmount = data.items?.reduce(
    (acc: number, item: OrderDoc) => acc + item.price,
    0
  );

  return (
    <Dialog
      header="Invoice Preview"
      draggable={false}
      visible={visible}
      className="w-[90%] mx-auto lg:w-1/2"
      onHide={() => setVisible(false)}
    >
      <div ref={targetRef} className="px-5 text-gray-800 font-sans">
        {/* Header Info */}
        <div className="flex flex-col lg:flex-row items-start justify-between py-4 gap-4 border-b mb-4">
          <div className="flex flex-col gap-1 w-full lg:w-1/2">
            <h2 className="font-bold text-lg capitalize">{data.consumer?.name || 'Unnamed Customer'}</h2>
            <p className="text-sm text-gray-600">{data.consumer?.address || 'No address provided'}</p>
            <p className="text-sm font-semibold">Date: {moment(data.createdAt).format("lll")}</p>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-end">
            <Barcode
              displayValue={false}
              width={1}
              height={50}
              value={data._id}
            />
            <p className="font-semibold mt-2">Supplier: {data.user?.name || 'Unknown'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="items pb-4">
          <table className="w-full text-sm border border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border py-2 px-3">#</th>
                <th className="border py-2 px-3">Item</th>
                <th className="border py-2 px-3">Price (₹)</th>
                <th className="border py-2 px-3">Qty</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.length > 0 ? (
                data.items.map((item: OrderDoc, i: number) => (
                  <tr key={i} className="text-center">
                    <td className="border py-2">{i + 1}</td>
                    <td className="border py-2 capitalize">{item.name}</td>
                    <td className="border py-2">₹{item.price}</td>
                    <td className="border py-2">{item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border py-3 text-center text-gray-500 italic">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
            {data.items?.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={2} className="border text-center font-semibold py-2">
                    Total
                  </td>
                  <td colSpan={2} className="border text-center font-semibold py-2">
                    ₹{totalAmount} /-
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex justify-end px-5 pt-2">
        <Button
          label="Download PDF"
          icon="pi pi-download"
          className="p-button-sm p-button-success"
          onClick={() =>
            toPDF({
              method: 'open',
              page: { format: 'A4' },
            })
          }
        />
      </footer>
    </Dialog>
  );
};

export default ShowAndPrintModel;
