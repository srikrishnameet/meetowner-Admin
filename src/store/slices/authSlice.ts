import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../utils/axiosInstance";
interface LoginRequest {
  mobile: string;
  password: string;
}
interface SendOtpRequest {
  mobile: string;
}
interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}
interface User {
  user_id: number;
  mobile: string;
  name: string;
  user_type: number;
  email: string;
  state: string | null;
  city: string | null;
  pincode: string | null;
  status: number | null;
  created_userID: number | null;
  created_by: string | null;
  photo: string | null;
  alt_mobile?: string | null;
  address?: string | null;
  gst_number?: string | null;
  rera_number?: string | null;
  designation?: string | null;
  created_date?: string | null;
  created_time?: string | null;
  updated_date?: string | null;
  updated_time?: string | null;
  location?: number | null;
  from_app?: number | null;
  uploaded_from_seller_panel?: string | null;
}
interface ProfileResponse {
  id: number;
  mobile: string;
  name: string;
  user_type: number;
  email: string;
  state: string | null;
  city: string | null;
  pincode: string | null;
  status: number | null;
  created_userID: number | null;
  created_by: string | null;
  photo: string | null;
  alt_mobile?: string | null;
  address?: string | null;
  gst_number?: string | null;
  rera_number?: string | null;
  designation?: string | null;
  created_date?: string | null;
  created_time?: string | null;
  updated_date?: string | null;
  updated_time?: string | null;
  location?: number | null;
  from_app?: number | null;
  uploaded_from_seller_panel?: string | null;
}
interface LoginResponse {
  message: string;
  user: User;
  token: string;
}
interface OtpResponse {
  status: string;
  message: string;
  apiResponse?: any;
}
interface ErrorResponse {
  message?: string;
}
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  userCounts: UserCount[] | null;
  otpSent: boolean;
  otpVerified: boolean;
  tempUser: User | null;
  tempToken: string | null;
}
interface DecodedToken {
  exp: number;
  [key: string]: any;
}
interface UserCount {
  user_type: string;
  count: number;
  trend?: "up" | "down";
  percentage?: number;
}
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginRequest, { rejectWithValue, dispatch }) => {
    try {
      const promise = axiosInstance.post<LoginResponse>("/auth/v1/loginAgent", credentials);
      toast.promise(promise, {
        loading: "Logging in...",
        success: "Login successful! Sending OTP...",
        error: "Login failed",
      });
      const response = await promise;
      await dispatch(sendOtpAdmin({ mobile: credentials.mobile }));
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Login error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Invalid mobile number or password");
          case 404:
            return rejectWithValue("Login service not found (404). Please try again later.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "An unexpected error occurred"
            );
        }
      }
      if (axiosError.code === "ECONNABORTED" || axiosError.message === "Network Error") {
        return rejectWithValue("Network error. Please check your connection and try again.");
      }
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);
export const sendOtpAdmin = createAsyncThunk(
  "auth/sendOtpAdmin",
  async ({ mobile }: SendOtpRequest, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<OtpResponse>("/auth/v1/sendOtpAdmin", {
        params: { mobile },
      });
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Send OTP error:", axiosError);
      toast.error("Failed to send OTP");
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);
export const verifyOtpAdmin = createAsyncThunk(
  "auth/verifyOtpAdmin",
  async ({ mobile, otp }: VerifyOtpRequest, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await axiosInstance.post<OtpResponse>("/auth/v1/verifyOtpAdmin", {
        mobile,
        otp,
      });
      toast.success(response.data.message);
      const state = getState() as { auth: AuthState };
      const userId = state.auth.tempUser?.user_id;
      if (!userId) {
        throw new Error("User ID not found in temporary state");
      }
      await dispatch(getProfile(userId)).unwrap();
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse> | Error;
      console.error("Verify OTP error:", axiosError);
      toast.error(
        axiosError instanceof AxiosError
          ? axiosError.response?.data?.message || "Failed to verify OTP"
          : axiosError.message || "Failed to verify OTP"
      );
      return rejectWithValue(
        axiosError instanceof AxiosError
          ? axiosError.response?.data?.message || "Failed to verify OTP"
          : axiosError.message || "Failed to verify OTP"
      );
    }
  }
);
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (user_id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ProfileResponse>(
        `/user/v1/getEmpProfile?user_id=${user_id}`
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get profile error:", axiosError);
      if (axiosError.response) {
        const status = axiosError.response.status;
        switch (status) {
          case 401:
            return rejectWithValue("Unauthorized access. Please log in again.");
          case 404:
            return rejectWithValue("User profile not found.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              axiosError.response.data?.message || "Failed to fetch user profile."
            );
        }
      }
      if (axiosError.code === "ECONNABORTED" || axiosError.message === "Network Error") {
        return rejectWithValue("Network error. Please check your connection and try again.");
      }
      return rejectWithValue("Failed to fetch user profile.");
    }
  }
);
export const getAllUsersCount = createAsyncThunk(
  "auth/getAllUsersCount",
  async (_, { rejectWithValue }) => {
    try {
      const promise = axiosInstance.get<UserCount[]>("/user/v1/getAllUsersCount");
      const response = await promise;
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: Expected an array");
      }
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse> | Error;
      console.error("Error fetching user counts:", axiosError);
      return rejectWithValue(
        axiosError instanceof AxiosError
          ? axiosError.response?.data || { message: "Failed to fetch user counts" }
          : { message: axiosError.message }
      );
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    userCounts: null,
    otpSent: false,
    otpVerified: false,
    tempUser: null,
    tempToken: null,
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.userCounts = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.tempUser = null;
      state.tempToken = null;
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("userType");
      localStorage.removeItem("email");
      localStorage.removeItem("mobile");
      localStorage.removeItem("city");
      localStorage.removeItem("state");
      localStorage.removeItem("userId");
      localStorage.removeItem("photo");
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.error = null;
      state.tempUser = null;
      state.tempToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.tempUser = {
          user_id: action.payload.user.user_id,
          mobile: action.payload.user.mobile,
          name: action.payload.user.name,
          user_type: action.payload.user.user_type,
          email: action.payload.user.email || "",
          state: action.payload.user.state || null,
          city: action.payload.user.city || null,
          pincode: action.payload.user.pincode || null,
          status: action.payload.user.status ?? null,
          created_userID: action.payload.user.created_userID ?? null,
          created_by: action.payload.user.created_by || null,
          photo: action.payload.user.photo || null,
        };
        state.tempToken = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendOtpAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpAdmin.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOtpAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tempUser = null;
        state.tempToken = null;
      })
      .addCase(verifyOtpAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpAdmin.fulfilled, (state) => {
        state.loading = false;
        state.otpVerified = true;
        state.isAuthenticated = true;
        state.user = state.tempUser;
        state.token = state.tempToken;
        if (state.tempUser && state.tempToken) {
          localStorage.setItem("token", state.tempToken);
          localStorage.setItem("name", state.tempUser.name);
          localStorage.setItem("userType", state.tempUser.user_type.toString());
          localStorage.setItem("email", state.tempUser.email || "");
          localStorage.setItem("mobile", state.tempUser.mobile);
          localStorage.setItem("city", state.tempUser.city || "");
          localStorage.setItem("state", state.tempUser.state || "");
          localStorage.setItem("userId", state.tempUser.user_id.toString());
          localStorage.setItem("photo", state.tempUser.photo || "");
        }
      })
      .addCase(verifyOtpAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tempUser = null;
        state.tempToken = null;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          user_id: action.payload.id,
          mobile: action.payload.mobile,
          name: action.payload.name,
          user_type: action.payload.user_type,
          email: action.payload.email || "",
          state: action.payload.state || null,
          city: action.payload.city || null,
          pincode: action.payload.pincode || null,
          status: action.payload.status ?? null,
          created_userID: action.payload.created_userID ?? null,
          created_by: action.payload.created_by || null,
          photo: action.payload.photo || null,
          alt_mobile: action.payload.alt_mobile || null,
          address: action.payload.address || null,
          gst_number: action.payload.gst_number || null,
          rera_number: action.payload.rera_number || null,
          designation: action.payload.designation || null,
          created_date: action.payload.created_date || null,
          created_time: action.payload.created_time || null,
          updated_date: action.payload.updated_date || null,
          updated_time: action.payload.updated_time || null,
          location: action.payload.location || null,
          from_app: action.payload.from_app || null,
          uploaded_from_seller_panel: action.payload.uploaded_from_seller_panel || null,
        };
        localStorage.setItem("name", action.payload.name);
        localStorage.setItem("userType", action.payload.user_type.toString());
        localStorage.setItem("email", action.payload.email || "");
        localStorage.setItem("mobile", action.payload.mobile);
        localStorage.setItem("city", action.payload.city || "");
        localStorage.setItem("state", action.payload.state || "");
        localStorage.setItem("userId", action.payload.id.toString());
        localStorage.setItem("photo", action.payload.photo || "");
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.otpVerified = false;
        state.tempUser = null;
        state.tempToken = null;
        localStorage.clear();
      })
      .addCase(getAllUsersCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsersCount.fulfilled, (state, action) => {
        state.loading = false;
        state.userCounts = action.payload;
      })
      .addCase(getAllUsersCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};
export const { logout, resetOtpState } = authSlice.actions;
export default authSlice.reducer;