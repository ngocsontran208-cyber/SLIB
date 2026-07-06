import React from 'react';

interface WithPermissionProps {
  requiredRole?: 'Student' | 'Librarian' | 'Admin';
  requiredClaim?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({
  requiredRole,
  requiredClaim,
  fallback = null,
  children
}) => {
  // TODO: Thay thế bằng dữ liệu lấy từ Context/Redux chứa thông tin JWT
  const user = {
    role: 'Admin', // Dummy data
    claims: ['can_edit_catalog', 'can_weed_items']
  };

  let hasAccess = true;

  if (requiredRole && user.role !== requiredRole && user.role !== 'Admin') {
    hasAccess = false;
  }

  if (requiredClaim && !user.claims.includes(requiredClaim)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default WithPermission;
