import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@slib/i18n'; // Khởi tạo đa ngôn ngữ
import { Toaster } from '@slib/ui-core';

import { AdminLayout } from './components/Layout/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ErmConfig } from './pages/erm/ErmConfig';
import { Sip2Config } from './pages/sip2/Sip2Config';
import { SruConfig } from './pages/sru/SruConfig';
import { UserManagement } from './pages/users/UserManagement';
import { MarcTemplateConfig } from './pages/marc/MarcTemplateConfig';
import { MarcTemplateForm } from './pages/marc/MarcTemplateForm';
import { SystemPolicyConfig } from './pages/settings/SystemPolicyConfig';
import { TemplateBuilder } from './pages/settings/TemplateBuilder';
import { VendorManagement } from './pages/acquisition/VendorManagement';
import { FundManagement } from './pages/acquisition/FundManagement';
import { PurchaseOrderManagement } from './pages/acquisition/PurchaseOrderManagement';
import { SerialsManagement } from './features/acquisition/components/SerialsManagement';
import { BibliographicManagement } from './pages/cataloging/BibliographicManagement';
import { CatalogingForm } from './pages/cataloging/CatalogingForm';
import { ItemRegistration } from './pages/cataloging/ItemRegistration';
import { BorrowReturn } from './features/circulation/components/BorrowReturn';
import { CourseReserveDashboard } from './features/course-reserves/components/CourseReserveDashboard';
import { InventoryDashboard } from './features/inventory/components/InventoryDashboard';
import { IllKanbanBoard } from './features/ill/components/IllKanbanBoard';
import { FineManagement } from './pages/circulation/FineManagement';
import { PatronManagement } from './pages/circulation/PatronManagement';
import { RenewManagement } from './pages/circulation/RenewManagement';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Role-based Protected Route
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'Admin' | 'Librarian' }) => {
  const { user, loading, isAdmin, isLibrarian, logout } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">Loading application...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không phải Admin và Librarian (VD: Student)
  if (!isAdmin && !isLibrarian) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Truy cập bị từ chối</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Tài khoản của bạn không có quyền truy cập vào Staff Portal. Vui lòng đăng nhập bằng tài khoản Cán bộ thư viện hoặc Quản trị viên.
          </p>
          <button 
            onClick={() => logout()}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  // Block Librarian from accessing Admin-only routes
  if (requiredRole === 'Admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes (Accessible by anyone logged in, usually Librarian and Admin) */}
            <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              
              {/* Circulation */}
              <Route path="admin/circulation/borrow-return" element={<ProtectedRoute requiredRole="Librarian"><BorrowReturn /></ProtectedRoute>} />
              <Route path="admin/circulation/course-reserves" element={<ProtectedRoute requiredRole="Librarian"><CourseReserveDashboard /></ProtectedRoute>} />
              <Route path="admin/circulation/ill" element={<ProtectedRoute requiredRole="Librarian"><IllKanbanBoard /></ProtectedRoute>} />

              {/* Acquisition */}
              <Route path="admin/acquisition/serials" element={<ProtectedRoute requiredRole="Librarian"><SerialsManagement /></ProtectedRoute>} />

              {/* Inventory */}
              <Route path="admin/inventory/stocktake" element={<ProtectedRoute requiredRole="Librarian"><InventoryDashboard /></ProtectedRoute>} />

              <Route path="marc/templates" element={<MarcTemplateForm />} />
              <Route path="erm/licenses" element={<ErmConfig />} />
              <Route path="sip2/config" element={<Sip2Config />} />
              <Route path="acquisition/serials" element={<SerialsManagement />} />
              
              {/* Cataloging Module (Librarians & Admins) */}
              <Route path="admin/cataloging/records" element={<ProtectedRoute requiredRole="Librarian"><BibliographicManagement /></ProtectedRoute>} />
              <Route path="admin/cataloging/create" element={<ProtectedRoute requiredRole="Librarian"><CatalogingForm /></ProtectedRoute>} />
              <Route path="admin/cataloging/edit/:id" element={<ProtectedRoute requiredRole="Librarian"><CatalogingForm /></ProtectedRoute>} />
              <Route path="admin/cataloging/items/:recordId" element={<ProtectedRoute requiredRole="Librarian"><ItemRegistration /></ProtectedRoute>} />

              {/* Circulation Module (Librarians & Admins) */}
              <Route path="admin/circulation/borrow-return" element={<ProtectedRoute requiredRole="Librarian"><BorrowReturn /></ProtectedRoute>} />
              <Route path="admin/circulation/patrons" element={<ProtectedRoute requiredRole="Librarian"><PatronManagement /></ProtectedRoute>} />
              {/* <Route path="admin/circulation/loans" element={<ProtectedRoute requiredRole="Librarian"><LoanHistory /></ProtectedRoute>} /> */}
              <Route path="admin/circulation/renew" element={<ProtectedRoute requiredRole="Librarian"><RenewManagement /></ProtectedRoute>} />
              <Route path="admin/circulation/fines" element={<ProtectedRoute requiredRole="Librarian"><FineManagement /></ProtectedRoute>} />

              {/* Acquisition Module (Librarians & Admins) */}
              <Route path="admin/vendors" element={<ProtectedRoute requiredRole="Librarian"><VendorManagement /></ProtectedRoute>} />
              <Route path="admin/funds" element={<ProtectedRoute requiredRole="Librarian"><FundManagement /></ProtectedRoute>} />
              <Route path="admin/purchase-orders" element={<ProtectedRoute requiredRole="Librarian"><PurchaseOrderManagement /></ProtectedRoute>} />
              
              {/* ERM & SIP2 & SRU (Usually Admin, but keeping open if Librarian needs it. Let's restrict to Admin for system tools) */}
              <Route path="admin/erm-sushi" element={<ProtectedRoute requiredRole="Admin"><ErmConfig /></ProtectedRoute>} />
              <Route path="admin/sip2-devices" element={<ProtectedRoute requiredRole="Admin"><Sip2Config /></ProtectedRoute>} />
              <Route path="admin/sru-cataloging" element={<ProtectedRoute requiredRole="Admin"><SruConfig /></ProtectedRoute>} />
              
              {/* MARC Templates (Admin Only) */}
              <Route path="admin/marc-templates" element={<ProtectedRoute requiredRole="Admin"><MarcTemplateConfig /></ProtectedRoute>} />
              <Route path="admin/marc-templates/create" element={<ProtectedRoute requiredRole="Admin"><MarcTemplateForm /></ProtectedRoute>} />
              <Route path="admin/marc-templates/edit/:id" element={<ProtectedRoute requiredRole="Admin"><MarcTemplateForm /></ProtectedRoute>} />
              
              {/* System Admin Tools */}
              <Route path="admin/users" element={<ProtectedRoute requiredRole="Admin"><UserManagement /></ProtectedRoute>} />
              <Route path="admin/policies" element={<ProtectedRoute requiredRole="Admin"><SystemPolicyConfig /></ProtectedRoute>} />
              <Route path="admin/templates" element={<ProtectedRoute requiredRole="Admin"><TemplateBuilder /></ProtectedRoute>} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
