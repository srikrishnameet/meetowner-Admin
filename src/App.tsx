import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";

import FormElements from "./pages/Forms/FormElements";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AboutUsPage from "./pages/Forms/AboutUs";
import ServicesPage from "./pages/Forms/Services";
import PropertyLeads from "./pages/LeadManagement/Leads";
import ResidentialBuyEdit from "./pages/Residential/Buy/ResidentialBuyEdit";
import ResidentialRentEdit from "./pages/Residential/Rent/ResidentialRentEdit";
import CareersPage from "./pages/Forms/Careers";
import TermsPage from "./pages/Forms/Terms";
import PrivacyPage from "./pages/Forms/privacy";
import CommercialBuyEdit from "./pages/Commercial/Buy/CommercialBuyEdit";
import CommercialRentEdit from "./pages/Commercial/Rent/CommercialRentEdit";
import CreateEmployee from "./pages/Employee/CreateEmployee";
import AllEmployees from "./pages/Employee/AllEmployees";
import PaymentSuccessUsers from "./pages/Accounts/Users/paymentSuccess";
import PaymentSuccessAgents from "./pages/Accounts/Agents/PaymentSuccess";
import InvoiceDownload from "./pages/Employee/Invoice";

import BasicTables from "./pages/Tables/BasicTables";
import { ProtectedRouteProps,  } from "./types/auth";

import { AppDispatch, RootState } from "./store/store";
import { isTokenExpired, logout } from "./store/slices/authSlice";
import BasicTableOne from "./components/tables/BasicTables/BasicTableOne";
import LocationManager from "./pages/maps/locality";
import { Toaster } from "react-hot-toast"; 
import { lazy, Suspense } from "react";
import { TableLoader } from "./components/Loaders/LoadingLisings";





const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token,  } = useSelector(
    (state: RootState) => state.auth
  );

  // Check if token is expired
  const tokenExpired = isTokenExpired(token,);

  if (!isAuthenticated || tokenExpired) {
    if (tokenExpired) {
      dispatch(logout()); 
    }
    return <Navigate to="/signin" replace />;
  }

  return children;
};

const ResidentialTypes = lazy(() => import("../src/pages/Residential/Buy/ResidentialTypes"));
const CommercialTypes =  lazy(()=> import("../src/pages/Commercial/Buy/CommercialType"));

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route
              index
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
             <Route
              index
              path="/basic-tables"
              element={
                <ProtectedRoute>
                  <BasicTables />
                </ProtectedRoute>
              }
            />

             <Route
              index
              path="/basic-tables-one"
              element={
                <ProtectedRoute>
                  <BasicTableOne />
                </ProtectedRoute>
              }
            />


            {/* listing pages */}
            {/* residential */}
            <Route
              path="/residential/:property_for/:status"
                element={
                  <Suspense
                    fallback={
                      <TableLoader
                        title="Loading Residential Listings" // Static title for lazy loading
                        hasActions={true} // Default to true; adjust as needed
                      />
                    }
                  >
                  <ProtectedRoute>
                    <ResidentialTypes />
                  </ProtectedRoute>
                </Suspense>
                }
            />
            <Route
              path="/commercial/:property_for/:status"
              element={
                <Suspense
                  fallback={
                    <TableLoader
                      title="Loading Commercial Listings"
                      hasActions={true}
                    />
                  }
                >
                  <ProtectedRoute>
                    <CommercialTypes />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            
            <Route
              path="residential-buy-edit"
              element={
                <ProtectedRoute>
                  <ResidentialBuyEdit />
                </ProtectedRoute>
              }
            />
           

            <Route
              path="residential-rent-edit"
              element={
                <ProtectedRoute>
                  <ResidentialRentEdit />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/commercial-buy-edit"
              element={
                <ProtectedRoute>
                  <CommercialBuyEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commercial-rent-edit"
              element={
                <ProtectedRoute>
                  <CommercialRentEdit />
                </ProtectedRoute>
              }
            />

            {/* Others Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfiles />
                </ProtectedRoute>
              }
            />
           
          

            {/* Lead Management */}
            <Route
              path="/leads/:property_for/:status"
              element={
                <ProtectedRoute>
                  <PropertyLeads />
                </ProtectedRoute>
              }
            />

            {/* Forms */}
            <Route
              path="/form-elements"
              element={
                <ProtectedRoute>
                  <FormElements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about-us"
              element={
                <ProtectedRoute>
                  <AboutUsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/careers"
              element={
                <ProtectedRoute>
                  <CareersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/terms"
              element={
                <ProtectedRoute>
                  <TermsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/privacy"
              element={
                <ProtectedRoute>
                  <PrivacyPage />
                </ProtectedRoute>
              }
            />

            {/* users */}
            <Route
              path="/users/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessUsers />
                </ProtectedRoute>
              }
            />
            {/* agents */}
            <Route
              path="/agents/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessAgents />
                </ProtectedRoute>
              }
            />

            {/* Employee details */}
            <Route
              path="/create-employee"
              element={
                <ProtectedRoute>
                  <CreateEmployee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-employees"
              element={
                <ProtectedRoute>
                  <AllEmployees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice"
              element={
                <ProtectedRoute>
                  <InvoiceDownload />
                </ProtectedRoute>
              }
            />

            <Route
                path="/maps/locality"
                element={
                  <ProtectedRoute>
                    <LocationManager />
                  </ProtectedRoute>
                }
              />
            </Route>

        

          {/* locations   */}

         
          

          {/* Auth Layout - Keep these public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route - Keep this public */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster /> 
      </Router>
    </>
  );
}