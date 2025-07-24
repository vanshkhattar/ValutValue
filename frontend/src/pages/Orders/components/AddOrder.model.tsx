import { Dialog } from 'primereact/dialog';
import { ErrorMessage, Field, Formik, FieldArray } from 'formik';
import { toast } from 'sonner';
import * as yup from 'yup';
import { useGetForSearchUserQuery } from '../../../provider/queries/Users.query';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { FaTrashAlt } from "react-icons/fa";
import Loader from '../../../components/Loader';
import moment from 'moment';
import { useCreateOrderMutation } from '../../../provider/queries/Orders.query';
import { classNames } from 'primereact/utils';
import { Message } from 'primereact/message'; // ✅ Missing import added

interface AddOrderModelProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
}

const AddOrderModel: React.FC<AddOrderModelProps> = ({ visible, setVisible }) => {

    const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
    const { isLoading: isUsersLoading, isFetching: isUsersFetching, data: usersData, error: usersError, refetch: refetchUsers } = useGetForSearchUserQuery({});

    const validationSchema = yup.object({
        user: yup.mixed().required("Please select a user."),
        items: yup.array().of(
            yup.object().shape({
                name: yup.string().required("Item name is required."),
                price: yup.number()
                    .typeError("Price must be a number.")
                    .min(0.01, "Price must be greater than 0.")
                    .required("Item price is required."),
                quantity: yup.number()
                    .typeError("Quantity must be a number.")
                    .min(1, "Quantity must be at least 1.")
                    .required("Item quantity is required.")
            })
        ).min(1, "At least one item is required for the order.")
    });

    const initialValues = {
        user: null,
        items: [{ name: '', price: '', quantity: '' }]
    };

    const selectedUserTemplate = (option: any, props: any) => {
        if (option) {
            return (
                <div className="flex items-center">
                    <span className='capitalize font-medium'>{option.name}</span>
                    <span className='text-gray-500 ml-2 text-sm'>({moment(new Date(option.dob)).format("DD MMM YYYY")})</span>
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    };

    const userOptionTemplate = (option: any) => (
        <div className="flex items-center">
            <span className='font-medium'>{option.name}</span>
            <span className='text-gray-500 ml-2 text-sm'>({moment(new Date(option.dob)).format("DD MMM YYYY")})</span>
        </div>
    );

    const onSubmitHandler = async (values: typeof initialValues, { resetForm }: any) => {
        try {
            const itemsToSend = values.items.map(item => ({
                ...item,
                price: parseFloat(item.price as string),
                quantity: parseInt(item.quantity as string)
            }));

            const payload = {
                user: values.user._id,
                items: itemsToSend,
            };

            const { data, error }: any = await createOrder(payload);

            if (error) {
                toast.error(error.data?.message || "Failed to create order.");
                return;
            }

            toast.success(data?.message || "Order created successfully!");
            resetForm();
            setVisible(false);
        } catch (e: any) {
            toast.error(e.message || "An unexpected error occurred.");
        }
    };

    if (isUsersLoading || isUsersFetching) {
        return (
            <Dialog
                header="Add Order"
                visible={visible}
                draggable={false}
                position='top'
                className="w-full md:w-[70%] lg:w-[60%] flex items-center justify-center min-h-[200px]"
                onHide={() => setVisible(false)}
            >
                <Loader />
                <p className="mt-4 text-center text-lg text-gray-600">Loading users...</p>
            </Dialog>
        );
    }

    if (usersError) {
        return (
            <Dialog
                header="Add Order"
                visible={visible}
                draggable={false}
                position='top'
                className="w-full md:w-[70%] lg:w-[60%] flex flex-col items-center justify-center min-h-[200px] bg-red-50 p-6 rounded-lg shadow-md border border-red-200"
                onHide={() => setVisible(false)}
            >
                <Message severity="error" text="Failed to load user data. Please try again." className="mb-4" />
                <Button
                    label="Retry"
                    icon="pi pi-refresh"
                    onClick={() => refetchUsers()}
                    className="p-button-danger p-button-outlined"
                />
            </Dialog>
        );
    }

    return (
        <Dialog
            draggable={false}
            header="Add New Order"
            position='top'
            visible={visible}
            className="w-full md:w-[70%] lg:w-[60%] max-h-[90vh] overflow-y-auto"
            onHide={() => setVisible(false)}
        >
            <Formik onSubmit={onSubmitHandler} initialValues={initialValues} validationSchema={validationSchema}>
                {({ values, setFieldValue, handleSubmit, errors, touched }) => (
                    <form onSubmit={handleSubmit} className="w-full p-4">
                        <div className="mb-6">
                            <label htmlFor="user" className="block text-gray-700 text-sm font-bold mb-2">
                                Select User <span className="text-red-500 text-sm">*</span>
                            </label>
                            <Dropdown
                                id="user"
                                value={values.user}
                                onChange={(e) => setFieldValue('user', e.value)}
                                options={usersData?.users || []}
                                optionLabel="name"
                                filter
                                filterBy="name,dob"
                                placeholder="Search or select a User"
                                emptyFilterMessage="No user found with that name."
                                emptyMessage="No users available to select."
                                valueTemplate={selectedUserTemplate}
                                itemTemplate={userOptionTemplate}
                                className={classNames("w-full border rounded-md", { 'p-invalid': errors.user && touched.user })}
                            />
                            <ErrorMessage name='user' className='text-red-500 text-xs mt-1' component={'p'} />
                        </div>

                        <div className="mb-6 border border-gray-200 p-4 rounded-lg bg-gray-50">
                            <label className="block text-gray-700 text-sm font-bold mb-3">
                                Order Items <span className="text-red-500 text-sm">*</span>
                            </label>
                            <FieldArray name='items'>
                                {({ push, remove }) => (
                                    <>
                                        <div className="flex justify-end mb-4">
                                            <Button
                                                type='button'
                                                onClick={() => push({ name: '', price: '', quantity: '' })}
                                                label="Add Item"
                                                icon="pi pi-plus"
                                                className="p-button-sm p-button-secondary"
                                            />
                                        </div>

                                        {values.items.length === 0 && (
                                            <p className="text-gray-500 text-center py-4">No items added yet. Click 'Add Item' to start.</p>
                                        )}

                                        {values.items.map((item, i) => (
                                            <div key={i} className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4 p-3 border border-gray-200 rounded-md bg-white shadow-sm">
                                                <div className="flex-1 w-full md:w-auto">
                                                    <Field
                                                        name={`items[${i}].name`}
                                                        className={classNames("w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 focus:outline-none", { 'p-invalid': errors.items?.[i]?.name && touched.items?.[i]?.name })}
                                                        placeholder="Item Name"
                                                    />
                                                    <ErrorMessage name={`items[${i}].name`} className='text-red-500 text-xs mt-1' component={'p'} />
                                                </div>

                                                <div className="flex-1 w-full md:w-auto">
                                                    <Field
                                                        type="number"
                                                        name={`items[${i}].price`}
                                                        className={classNames("w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 focus:outline-none", { 'p-invalid': errors.items?.[i]?.price && touched.items?.[i]?.price })}
                                                        placeholder="Price (e.g., 99.99)"
                                                    />
                                                    <ErrorMessage name={`items[${i}].price`} className='text-red-500 text-xs mt-1' component={'p'} />
                                                </div>

                                                <div className="flex-1 w-full md:w-auto">
                                                    <Field
                                                        type="number"
                                                        name={`items[${i}].quantity`}
                                                        className={classNames("w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-200 focus:outline-none", { 'p-invalid': errors.items?.[i]?.quantity && touched.items?.[i]?.quantity })}
                                                        placeholder="Quantity (e.g., 1)"
                                                    />
                                                    <ErrorMessage name={`items[${i}].quantity`} className='text-red-500 text-xs mt-1' component={'p'} />
                                                </div>

                                                <div className="w-full md:w-auto flex justify-end md:justify-start">
                                                    <Button
                                                        type='button'
                                                        onClick={() => remove(i)}
                                                        icon={<FaTrashAlt />}
                                                        className="p-button-danger p-button-text p-button-sm"
                                                        tooltip="Remove Item"
                                                        tooltipOptions={{ position: 'top' }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {errors.items && typeof errors.items === 'string' && touched.items && (
                                            <p className='text-red-500 text-xs mt-1'>{errors.items}</p>
                                        )}
                                    </>
                                )}
                            </FieldArray>
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button
                                type="submit"
                                label={isCreatingOrder ? "Creating Order..." : "Create Order"}
                                icon={isCreatingOrder ? "pi pi-spin pi-spinner" : "pi pi-check"}
                                className="p-button-success px-6 py-3 text-lg"
                                disabled={isCreatingOrder}
                            />
                        </div>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

export default AddOrderModel;
