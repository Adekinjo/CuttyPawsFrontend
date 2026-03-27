import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "./AuthService";



export const ProtectedRoute = ({ element: Component }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      console.log("[ProtectedRoute] checkAuth:start", {
        pathname: location.pathname,
        hasRefreshToken: Boolean(refreshToken),
        hasToken: Boolean(localStorage.getItem("token")),
      });

      if (!refreshToken) {
        console.warn("[ProtectedRoute] checkAuth:no-refresh-token", {
          pathname: location.pathname,
        });
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const refreshed = await ApiService.refreshTokenIfNeeded();
        console.log("[ProtectedRoute] checkAuth:refresh-result", {
          pathname: location.pathname,
          refreshed,
        });
        setAllowed(Boolean(refreshed));
      } catch (error) {
        console.error("[ProtectedRoute] checkAuth:error", {
          pathname: location.pathname,
          message: error.message,
        });
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) return null; // or spinner

  console.log("[ProtectedRoute] render", {
    pathname: location.pathname,
    loading,
    allowed,
  });
  return allowed
    ? <Component />
    : <Navigate to="/login" replace state={{ from: location }} />;
};


export const AdminRoute = ({ element: Component }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("[AdminRoute] check", {
      pathname: location.pathname,
      authenticated: ApiService.isAuthenticated(),
      isAdmin: ApiService.isAdmin(),
    });
    if (!ApiService.isAuthenticated()) {
      console.warn("[AdminRoute] redirect:unauthenticated", {
        pathname: location.pathname,
      });
      navigate('/login', { 
        replace: true, 
        state: { from: location } 
      });
      return;
    }

    if (!ApiService.isAdmin()) {
      console.warn("[AdminRoute] redirect:not-admin", {
        pathname: location.pathname,
      });
      ApiService.logout();
      toast.error("Unauthorized access! Admin privileges required.");
      navigate('/login', {
        replace: true,
        state: { from: location }
      });
    }
  }, [navigate, location]);

  return ApiService.isAdmin() ? <Component /> : null;
};


export const SupportRoute = ({ element: Component }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("[SupportRoute] check", {
      pathname: location.pathname,
      authenticated: ApiService.isAuthenticated(),
      isSupport: ApiService.isSupport(),
    });
    if (!ApiService.isAuthenticated()) {
      console.warn("[SupportRoute] redirect:unauthenticated", {
        pathname: location.pathname,
      });
      navigate('/login', { 
        replace: true, 
        state: { from: location } 
      });
      return;
    }

    if (!ApiService.isSupport()) {
      console.warn("[SupportRoute] redirect:not-support", {
        pathname: location.pathname,
      });
      ApiService.logout();
      toast.error("Unauthorized access! support privileges required.");
      navigate('/login', {
        replace: true,
        state: { from: location }
      });
    }
  }, [navigate, location]);

  return ApiService.isSupport() ? <Component /> : null;
};


export const SellerRoute = ({ element: Component }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("[SellerRoute] check", {
      pathname: location.pathname,
      authenticated: ApiService.isAuthenticated(),
      isSeller: ApiService.isSeller(),
    });
    if (!ApiService.isAuthenticated()) {
      console.warn("[SellerRoute] redirect:unauthenticated", {
        pathname: location.pathname,
      });
      navigate('/login', { 
        replace: true, 
        state: { from: location } 
      });
      return;
    }

    if (!ApiService.isSeller()) {
      console.warn("[SellerRoute] redirect:not-seller", {
        pathname: location.pathname,
      });
      ApiService.logout();
      toast.error("Unauthorized access! Seller privileges required.");
      navigate('/login', {
        replace: true,
        state: { from: location }
      });
    }
  }, [navigate, location]);

  return ApiService.isSeller() ? <Component /> : null;
};

export const ServiceProviderRoute = ({ element: Component }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("[ServiceProviderRoute] check", {
      pathname: location.pathname,
      authenticated: ApiService.isAuthenticated(),
      isServiceProvider: ApiService.isServiceProvider(),
      effectiveRole: ApiService.getEffectiveRole(),
    });

    if (!ApiService.isAuthenticated()) {
      console.warn("[ServiceProviderRoute] redirect:unauthenticated", {
        pathname: location.pathname,
      });
      navigate("/login", {
        replace: true,
        state: { from: location },
      });
      return;
    }

    if (!ApiService.isServiceProvider()) {
      console.warn("[ServiceProviderRoute] redirect:not-service-provider", {
        pathname: location.pathname,
        effectiveRole: ApiService.getEffectiveRole(),
      });
      ApiService.logout();
      toast.error("Unauthorized access! Service privileges required.");
      navigate("/login", {
        replace: true,
        state: { from: location },
      });
    }
  }, [navigate, location]);

  return ApiService.isServiceProvider() ? <Component /> : null;
};

