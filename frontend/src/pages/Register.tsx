import { ErrorMessage, Field, Formik } from "formik";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useRegisterUserMutation } from "../provider/queries/Auth.query";
import { toast } from "sonner";

const Register = () => {
  const [registerUser, registerUserResponse] = useRegisterUserMutation();
  const navigate = useNavigate();

  type User = {
    name: string;
    email: string;
    password: string;
  };

  const initialValues: User = {
    name: "",
    email: "",
    password: "",
  };

  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Email must be valid").required("Email is required"),
    password: yup
      .string()
      .min(5, "Password must be at least 5 characters")
      .required("Password is required"),
  });

  const onSubmitHandler = async (payload: User, { resetForm }: any) => {
    try {
      const { data, error }: any = await registerUser(payload);

      if (error) {
        toast.error(error.data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      resetForm();
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-white to-blue-100 p-4">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitHandler}
      >
        {({ handleSubmit }) => (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg"
            autoComplete="off"
          >
            <Card
              className="shadow-3 surface-card p-8 rounded-3xl border border-gray-200"
              title={<h2 className="text-center text-3xl font-bold text-gray-800">Create Account</h2>}
              subTitle={<p className="text-center text-sm text-gray-500 mt-2">Start your journey with us</p>}
            >
              <div className="mb-6">
                <label htmlFor="name" className="font-semibold block mb-2 text-gray-700">
                  Name
                </label>
                <Field name="name">
                  {({ field }: any) => (
                    <InputText
                      {...field}
                      id="name"
                      placeholder="e.g. Jane Doe"
                      className="w-full border border-gray-400 rounded-lg px-4 py-3"
                    />
                  )}
                </Field>
                <ErrorMessage
                  component="small"
                  name="name"
                  className="text-red-500 block mt-1"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="font-semibold block mb-2 text-gray-700">
                  Email
                </label>
                <Field name="email">
                  {({ field }: any) => (
                    <InputText
                      {...field}
                      id="email"
                      placeholder="jane@example.com"
                      className="w-full border border-gray-400 rounded-lg px-4 py-3"
                    />
                  )}
                </Field>
                <ErrorMessage
                  component="small"
                  name="email"
                  className="text-red-500 block mt-1"
                />
              </div>

              <div className="mb-8">
                <label htmlFor="password" className="font-semibold block mb-2 text-gray-700">
                  Password
                </label>
                <Field name="password">
                  {({ field }: any) => (
                    <Password
                      {...field}
                      id="password"
                      toggleMask={false}  // Toggle view disabled
                      feedback={false}
                      placeholder="••••••"
                      className="w-full border border-gray-400 rounded-lg px-4 py-3"
                    />
                  )}
                </Field>
                <ErrorMessage
                  component="small"
                  name="password"
                  className="text-red-500 block mt-1"
                />
              </div>

              <Button
                type="submit"
                label="Sign Up"
                loading={registerUserResponse.isLoading}
                className="w-full bg-red-500 border-none hover:bg-red-600 text-white font-semibold py-3 text-base rounded-lg"
              />

              <p className="text-center text-sm mt-6">
                Already have an account? {" "}
                <Link to="/login" className="text-red-600 font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </Card>
          </form>
        )}
      </Formik>
    </section>
  );
};

export default Register;
