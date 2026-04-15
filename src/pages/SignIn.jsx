import { Navigate } from "react-router-dom";

// Legacy SignIn page — redirect to the main SignInPortal
export default function SignIn() {
  return <Navigate to="/signin" replace />;
}