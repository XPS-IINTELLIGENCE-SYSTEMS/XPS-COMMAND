import { Navigate } from "react-router-dom";

// CustomLogin now just redirects to the main SignInPortal
export default function CustomLogin() {
  return <Navigate to="/signin" replace />;
}