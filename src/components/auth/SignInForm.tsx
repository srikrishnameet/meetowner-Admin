import { useState, useEffect, KeyboardEvent, useRef } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router";
import {
  loginUser,
  sendOtpAdmin,
  verifyOtpAdmin,
  resetOtpState,
  sendWhatsapp,
  verifyWhatsappOtpLocally,
} from "../../store/slices/authSlice";
import { RootState, AppDispatch } from "../../store/store";
import { toast } from "react-hot-toast";
export default function SignInForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    otp: "",
    countryCode: "+91",
  });
  const [errors, setErrors] = useState({
    mobile: "",
    password: "",
    otp: "",
    general: "",
  });
  const {
    isAuthenticated,
    loading,
    error,
    otpSent,
    otpVerified,
    isWhatsappFlow,
  } = useSelector((state: RootState) => state.auth);
  const validateMobile = (mobile: string) => {
    const mobileRegex = /^\d{7,15}$/;
    return mobileRegex.test(mobile)
      ? ""
      : "Please enter a valid phone number (7-15 digits)";
  };
  const handleInputChange = (e: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = e.target;
    let cleanedValue = name === "mobile" ? value.replace(/\D/g, "") : value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: cleanedValue,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: name === "mobile" ? validateMobile(cleanedValue) : "",
      general: "",
    }));
  };
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (submitButtonRef.current) {
        submitButtonRef.current.click();
      }
    }
  };
  const handleSubmitLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const newErrors = { mobile: "", password: "", otp: "", general: "" };
    let hasError = false;
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      hasError = true;
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      hasError = true;
    }
    const mobileError = validateMobile(formData.mobile);
    if (mobileError) {
      newErrors.mobile = mobileError;
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      toast.error(newErrors.mobile || newErrors.password);
      return;
    }
    try {
      await dispatch(
        loginUser({
          mobile: formData.mobile,
          password: formData.password,
          isWhatsapp: false,
        })
      ).unwrap();
    } catch (err: any) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: err.message || "An unexpected error occurred",
      }));
      toast.error(err.message || "An unexpected error occurred");
    }
  };
  const handleWhatsappLogin = async () => {
    const newErrors = { mobile: "", password: "", otp: "", general: "" };
    let hasError = false;
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      hasError = true;
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      hasError = true;
    }
    const mobileError = validateMobile(formData.mobile);
    if (mobileError) {
      newErrors.mobile = mobileError;
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      toast.error(newErrors.mobile || newErrors.password);
      return;
    }
    try {
      await dispatch(
        loginUser({
          mobile: formData.mobile,
          password: formData.password,
          isWhatsapp: true,
          countryCode: formData.countryCode,
        })
      ).unwrap();
    } catch (err: any) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: err.message || "An unexpected error occurred",
      }));
      toast.error(err.message || "An unexpected error occurred");
    }
  };
  const handleSubmitOtp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const newErrors = { mobile: "", password: "", otp: "", general: "" };
    let hasError = false;
    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      toast.error(newErrors.otp);
      return;
    }
    try {
      if (isWhatsappFlow) {
        dispatch(verifyWhatsappOtpLocally({ otp: formData.otp }));
      } else {
        await dispatch(
          verifyOtpAdmin({
            mobile: formData.mobile,
            otp: formData.otp,
          })
        ).unwrap();
        navigate("/");
      }
    } catch (err: any) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        otp: err.message || "Failed to verify OTP",
      }));
      toast.error(err.message || "Failed to verify OTP");
    }
  };
  const handleResendOtp = async () => {
    try {
      if (isWhatsappFlow) {
        await dispatch(
          sendWhatsapp({
            mobile: formData.mobile,
            countryCode: formData.countryCode,
          })
        ).unwrap();
      } else {
        await dispatch(sendOtpAdmin({ mobile: formData.mobile })).unwrap();
      }
    } catch (err: any) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: err.message || "Failed to resend OTP",
      }));
      toast.error(err.message || "Failed to resend OTP");
    }
  };
  const handleBackToLogin = () => {
    dispatch(resetOtpState());
    setFormData((prev) => ({ ...prev, otp: "" }));
    setErrors({ mobile: "", password: "", otp: "", general: "" });
  };
  useEffect(() => {
    if (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: error,
      }));
    }
  }, [error]);
  useEffect(() => {
    if (isAuthenticated && otpVerified) {
      navigate("/");
    }
  }, [isAuthenticated, otpVerified, navigate]);
  if (isAuthenticated && otpVerified) {
    return <Navigate to="/" />;
  }
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {otpSent
                ? `Enter the OTP sent to your ${
                    isWhatsappFlow ? "WhatsApp" : "mobile number"
                  }`
                : "Enter your mobile number and password to sign in!"}
            </p>
          </div>
          <form
            ref={formRef}
            onSubmit={otpSent ? handleSubmitOtp : handleSubmitLogin}
          >
            <div className="space-y-6">
              {!otpSent ? (
                <>
                  <div>
                    <Label>
                      Mobile Number <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      name="mobile"
                      placeholder="Enter Mobile number"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      disabled={loading}
                      maxLength={15}
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-sm text-error-500">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-error-500">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>
                      OTP <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      name="otp"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      disabled={loading}
                      autoFocus
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="mt-1 text-sm text-error-500">
                        {errors.otp}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div>
                <Button
                  type="submit"
                  className="w-full"
                  size="sm"
                  disabled={loading}
                  ref={submitButtonRef}
                >
                  {loading
                    ? otpSent
                      ? "Verifying OTP..."
                      : "Signing in..."
                    : otpSent
                    ? "Verify OTP"
                    : "Sign in"}
                </Button>
              </div>
              {!otpSent && (
                <div>
                  <Button
                    type="button"
                    className="w-full bg-green-500 text-white hover:bg-green-600"
                    size="sm"
                    disabled={loading}
                    onClick={handleWhatsappLogin}
                  >
                    {loading ? "Signing in..." : "Sign in with WhatsApp"}
                  </Button>
                </div>
              )}
            </div>
            {otpSent && (
              <div className="flex justify-between mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  tabIndex={-1}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={loading}
                  tabIndex={-1}
                >
                  Resend OTP
                </Button>
              </div>
            )}
          </form>
          {errors.general && (
            <p className="mt-4 text-sm text-error-500 text-center">
              {errors.general}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
