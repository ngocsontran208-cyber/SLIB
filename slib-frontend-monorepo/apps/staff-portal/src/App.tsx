import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@slib/i18n'; // Khởi tạo đa ngôn ngữ

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
import { VendorManagement } from './pages/acquisition/VendorManagement';
import { FundManagement } from './pages/acquisition/FundManagement';
import { PurchaseOrderManagement } from './pages/acquisition/PurchaseOrderManagement';
import { BibliographicManagement } from './pages/cataloging/BibliographicManagement';
import { CatalogingForm } from './pages/cataloging/CatalogingForm';
import { ItemRegistration } from './pages/cataloging/ItemRegistration';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Role-based Protected Route
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'Admin' | 'Librarian' }) => {
  const { user, loading, isAdmin, isLibrarian } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">Loading application...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'Admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'Librarian' && !isAdmin && !isLibrarian) {
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
              
              {/* Cataloging Module (Librarians & Admins) */}
              <Route path="admin/cataloging/records" element={<ProtectedRoute requiredRole="Librarian"><BibliographicManagement /></ProtectedRoute>} />
              <Route path="admin/cataloging/create" element={<ProtectedRoute requiredRole="Librarian"><CatalogingForm /></ProtectedRoute>} />
              <Route path="admin/cataloging/edit/:id" element={<ProtectedRoute requiredRole="Librarian"><CatalogingForm /></ProtectedRoute>} />
              <Route path="admin/cataloging/items/:recordId" element={<ProtectedRoute requiredRole="Librarian"><ItemRegistration /></ProtectedRoute>} />

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
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
