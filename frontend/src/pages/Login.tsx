import { ErrorMessage, Field, Formik } from 'formik';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useLoginUserMutation } from '../provider/queries/Auth.query';
import { toast } from 'sonner';
import { useState } from 'react';

const Login = () => {
  const [LoginUser, LoginUserResponse] = useLoginUserMutation();
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);

  type User = {
    email: string;
    password: string;
  };

  const initialValues: User = {
    email: '',
    password: '',
  };

  const validationSchema = yup.object({
    email: yup.string().email("Email must be valid").required("Email is required"),
    password: yup.string().min(5, "Password must be at least 5 characters").required("Password is required"),
  });

  const onSubmitHandler = async (e: User, { resetForm }: any) => {
    try {
      const { data, error }: any = await LoginUser(e);

      if (error) {
        toast.error(error.data.message || "Login failed. Please check your credentials.");
        return;
      }

      if (rememberMe) {
        toast.success("Remember me is active! (Note: Actual persistence not implemented)");
      }

      localStorage.setItem("token", data.token);
      toast.success("Login successful! Redirecting...");
      resetForm();
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-red-100 p-4 font-sans">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler}>
        {({ handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit} className="w-full max-w-lg" autoComplete="off">
            <Card
              className="shadow-xl surface-card p-6 sm:p-8 rounded-3xl border border-gray-200 animate-fade-in-up"
              title={
                <div className="flex flex-col items-center mb-2">
                  <h2 className="text-center text-3xl font-extrabold text-gray-800">Sign In</h2>
                </div>
              }
              subTitle={<p className="text-center text-sm text-gray-500 mb-6">Login to your account</p>}
            >
              {/* Email Field */}
              <div className="mb-5">
                <label htmlFor="email" className="font-semibold block mb-2 text-gray-700">
                  Email
                </label>
                <Field name="email">
                  {({ field }: any) => (
                    <InputText
                      {...field}
                      id="email"
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  )}
                </Field>
                <ErrorMessage component="small" name="email" className="text-red-500 block mt-1 text-sm" />
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <label htmlFor="password" className="font-semibold block mb-2 text-gray-700">
                  Password
                </label>
                <Field name="password">
                    {({ field }: any) => (
                      <Password
                        {...field}
                        id="password"
                        toggleMask={true}
                        feedback={false}
                        placeholder="••••••"
                        className="w-full" // ✅ Ensure wrapper div is full width
                        inputClassName="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" // ✅ Match InputText styling
                      />
                    )}
                  </Field>

                <ErrorMessage component="small" name="password" className="text-red-500 block mt-1 text-sm" />
              </div>

              {/* Remember Me + Forgot */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                      toast.info(`Remember me: ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to="#" className="text-red-600 font-medium hover:underline text-sm transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                loading={LoginUserResponse.isLoading || isSubmitting}
                label="Login"
                className="w-full bg-red-500 border-none hover:bg-red-600 text-white font-semibold py-3 text-base rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                disabled={LoginUserResponse.isLoading || isSubmitting}
              />

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Buttons */}
              <div className="flex flex-col space-y-3">
                <Button
                  type="button"
                  label="Login with Google"
                  icon="pi pi-google"
                  className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-semibold py-3 text-base rounded-lg shadow-sm transition duration-200"
                  onClick={() => toast.info("Google login coming soon!")}
                />
                <Button
                  type="button"
                  label="Login with Facebook"
                  icon="pi pi-facebook"
                  className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-semibold py-3 text-base rounded-lg shadow-sm transition duration-200"
                  onClick={() => toast.info("Facebook login coming soon!")}
                />
              </div>

              {/* Register Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-700">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-red-600 font-semibold hover:underline transition-colors duration-200">
                    Register
                  </Link>
                </p>
              </div>
            </Card>
          </form>
        )}
      </Formik>

      {/* Card fade animation */}
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fadeInScale 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Login;
