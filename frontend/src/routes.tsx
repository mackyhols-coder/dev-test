import React, { lazy, useCallback, useEffect, useRef, useState } from "react";

// Layouts
import AuthLayout from "./layouts/Auth";
import DashboardLayout from "./layouts/Dashboard";

// Guards
import AuthGuard from "./components/guards/AuthGuard";

import { NAVIGATION_PATH } from "@/constants";
import { createBrowserRouter, useLocation } from "react-router-dom";
import SplashScreenLayout from "./layouts/SplashScreenLayout";
import Page500 from "./pages/errors/Page500";
import { cancelPendingRequests } from "./utils/axios";
import { UserProfile } from "./types/api/enums/UserProfile";


export const routes = createBrowserRouter([
    {
        path: "/",
        element: <DashboardLayout />,
        errorElement: <Page500 />,
        children: [
            { path: "", Component: lazy(() => import("@/pages/index")) },
        ]
    },
    {
        path: "loading",
        errorElement: <Page500 />,
        Component: SplashScreenLayout
    },
    
    {
        path: NAVIGATION_PATH.CLIENTS.ROOT,
        element: <AuthGuard belongsTo={[UserProfile.Administrator]}><DashboardLayout /></AuthGuard>,
        errorElement: <Page500 />,
        children: [
            { path: NAVIGATION_PATH.CLIENTS.LISTING.RELATIVE, Component: lazy(() => import("@/pages/clients/ClientListing")) },
            { path: NAVIGATION_PATH.CLIENTS.CREATE.RELATIVE, Component: lazy(() => import("@/pages/clients/ClientForm")) },
            
        ]
    },
    {
      path: NAVIGATION_PATH.USERS.ROOT,
      element: <AuthGuard belongsTo={[UserProfile.Administrator]}><DashboardLayout /></AuthGuard>,
      errorElement: <Page500 />,
      children: [
        { path: NAVIGATION_PATH.USERS.LISTING.RELATIVE, Component: lazy(() => import("@/pages/users/UserListing")) },
        { path: NAVIGATION_PATH.USERS.CREATE.RELATIVE, Component: lazy(() => import("@/pages/users/UserForm")) },
      ]
    },
    {
        path: NAVIGATION_PATH.AUTH.ROOT,
        element: <AuthLayout />,
        errorElement: <Page500 />,
        children: [
            { path: NAVIGATION_PATH.AUTH.SIGN_IN.RELATIVE, Component: lazy(() => import("@/pages/auth/SignIn")) },
        ],
    },
    {
        path: "*",
        element: <AuthLayout />,
        children: [
            { path: "*", Component: lazy(() => import("@/pages/errors/Page404")) }
        ],
    },
]);

export const NavigationWatcher = () => {
    const location = useLocation();
    const isNavigating = useRef(false);
    const [previousPath, setPreviousPath] = useState(location.pathname);

    const handleBeforeUnload = useCallback(() => {
        cancelPendingRequests();
    }, []);

    useEffect(() => {
        if (previousPath !== location.pathname) {
            isNavigating.current = true;
            setPreviousPath(location.pathname);
            cancelPendingRequests();

            const timeout = setTimeout(() => {
                isNavigating.current = false;
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [location.pathname, previousPath]);

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [handleBeforeUnload]);

    return null;
};