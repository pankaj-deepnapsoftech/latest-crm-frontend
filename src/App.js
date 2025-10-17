import logo from "./logo.svg";
import "./App.css";
import Login from "./components/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CRMPanel from "./components/CRMPanel";
import Dashboard from "./components/Dashboard/Dashboard";
import Customers from "./components/Customers/Customer";
import Peoples from "./components/Peoples/Peoples";
import Companies from "./components/Companies/Companies";
import ExpenseCategory from "./components/Expense Category/ExpenseCategory";
import Expenses from "./components/Expenses/Expenses";
import ProductCategory from "./components/Product Category/ProductCategory";
import Products from "./components/Products/Products";
import Leads from "./components/Leads/Leads";
import Offers from "./components/Offers/Offers";
import Invoices from "./components/Invoices/Invoices";
import ProformaInvoices from "./components/Proforma Invoices/ProformaInvoices";
import Payments from "./components/Payments/Payments";
import NotFound from "./components/NotFound";
import Register from "./components/Register";
import Admins from "./components/Admins/Admins";
import Reports from "./components/Reports/Reports";
import AssignedLeads from "./components/Leads/AssignedLeads";
import WebsiteConfiguration from "./components/Website Configuration/WebsiteConfiguration";
import Support from "./components/Support/Support";
import IndiamartLeads from "./components/Indiamart Leads/IndiamartLeads";
import AssignedSupport from "./components/Support/AssignedSupport";
import Settings from "./components/Settings/Settings";
import AccountSettings from "./components/Settings/AccountSettings";
import CompanySettings from "./components/Settings/CompanySettings";
import CompanyLogo from "./components/Settings/CompanyLogo";
import PDFSetting from "./components/Settings/PDFSetting";
import FinanceSettings from "./components/Settings/FinanceSettings";
import Home from "./subscription/pages/Home";
import { useState } from "react";
import Layout from "./subscription/pages/Layout";
import Pricing from "./subscription/pages/Pricing";
import Contact from "./subscription/pages/Contact";
import Checkout from "./subscription/pages/Checkout";
import PaymentFailed from "./subscription/pages/PaymentFailed";
import PaymentSuccess from "./subscription/pages/PaymentSuccess";
import PrivacyPolicy from "./subscription/pages/PrivacyPolicy";
import TermsAndConditions from "./subscription/pages/TermsAndConditions";
import EmailData from "./components/Emails/EmailData";
import Renewal from "./components/Renewal/Renewal";
import DataBank from "./components/DataBank/DataBank";
import ChatIndex from "./components/Chats/ChatIndex";
import Demo from "./components/Demo/Demo";
import DataExport from "./components/DataExport/DataExport";
import DocumentCenter from "./components/Document Center/DocumentCenter";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import SuperAdminLogin from "./components/SuperAdminLogin";
import SuperAdminRegister from "./components/SuperAdminRegister";
import SuperAdminLayout from "./components/SuperAdminLayout";
import SuperAdminLeads from "./components/modules/SuperAdminLeads";
import SuperAdminPeople from "./components/modules/SuperAdminPeople";
import SuperAdminCustomers from "./components/modules/SuperAdminCustomers";
import SuperAdminInvoices from "./components/modules/SuperAdminInvoices";
import SuperAdminPayments from "./components/modules/SuperAdminPayments";
import SuperAdminProducts from "./components/modules/SuperAdminProducts";
import SuperAdminSubscriptions from "./components/modules/SuperAdminSubscriptions";
import FloatingChat from "./components/Chats/FloatingChat";
import { useSelector } from "react-redux";
import Meetings from "./components/Meetings/Meetings";

function App() {
  const [showAuthenticationMenu, setShowAuthenticationMenu] = useState(false);
  const user = useSelector((state) => state.auth);

  return (
    <div>
      <BrowserRouter>
        {/* SUBSCRIPTION WEBSITE ROUTES */}
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                showAuthenticationMenu={showAuthenticationMenu}
                setShowAuthenticationMenu={setShowAuthenticationMenu}
              />
            }
          >
            <Route
              index
              element={
                <Home
                  showAuthenticationMenu={showAuthenticationMenu}
                  setShowAuthenticationMenu={setShowAuthenticationMenu}
                />
              }
            />
            <Route
              path="/pricing"
              element={
                <Pricing
                  showAuthenticationMenu={showAuthenticationMenu}
                  setShowAuthenticationMenu={setShowAuthenticationMenu}
                />
              }
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
          </Route>
          {/* CRM WEBSITE ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/super-admin-login" element={<SuperAdminLogin />} />
          <Route
            path="/super-admin-register"
            element={<SuperAdminRegister />}
          />
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="leads" element={<SuperAdminLeads />} />
            <Route path="people" element={<SuperAdminPeople />} />
            <Route path="customers" element={<SuperAdminCustomers />} />
            <Route path="invoices" element={<SuperAdminInvoices />} />
            <Route path="payments" element={<SuperAdminPayments />} />
            <Route path="products" element={<SuperAdminProducts />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
          </Route>
          <Route path="/crm" element={<CRMPanel />}>
            <Route index element={<Dashboard />} />
            <Route path="admins" element={<Admins />} />
            <Route path="customers" element={<Customers />} />
            <Route path="chats" element={<ChatIndex />} />
            <Route path="individuals" element={<Peoples />} />
            {/* <Route path="customers" element={<Companies />} /> */}
            <Route path="corporates" element={<Companies />} />
            <Route path="leads" element={<Leads />} />
            <Route path="demo" element={<Demo />} />
            <Route path="indiamart-leads" element={<IndiamartLeads />} />
            <Route path="justdial-leads" element={<IndiamartLeads />} />
            <Route path="facebook-leads" element={<IndiamartLeads />} />
            <Route path="instagram-leads" element={<IndiamartLeads />} />
            <Route path="google-leads" element={<IndiamartLeads />} />
            {/* <Route path="assigned-leads" element={<AssignedLeads />} /> */}
            <Route path="offers" element={<Offers />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="proforma-invoices" element={<ProformaInvoices />} />
            <Route path="payments" element={<Payments />} />
            <Route path="products" element={<Products />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="products-category" element={<ProductCategory />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="expenses-category" element={<ExpenseCategory />} />
            <Route path="report" element={<Reports />} />
            <Route path="emails" element={<EmailData />} />
            <Route path="renewals" element={<Renewal />} />
            <Route path="databank" element={<DataBank />} />
            <Route path="data-export" element={<DataExport />} />
            <Route path="document-center" element={<DocumentCenter />} />
            <Route
              path="website-configuration"
              element={<WebsiteConfiguration />}
            />
            <Route path="settings" element={<Settings />}>
              <Route index element={<AccountSettings />} />
              <Route path="company-settings" element={<CompanySettings />} />
              <Route path="company-logo" element={<CompanyLogo />} />
              <Route path="pdf-settings" element={<PDFSetting />} />
              <Route path="finance-settings" element={<FinanceSettings />} />
            </Route>
            <Route path="support" element={<Support />} />
            <Route path="assigned-support" element={<AssignedSupport />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Floating Chat Widget - Shows on all pages when user is logged in */}
        {user?.id && <FloatingChat />}
      </BrowserRouter>
    </div>
  );
}

export default App;
