import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/app/routes";

interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkSession = useAuthStore((state) => state.checkSession);

  const isValid = isAuthenticated && checkSession();

  if (isValid) {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || ROUTES.HOME;
    return (
      <Navigate
        to={from}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default PublicOnlyRoute;
