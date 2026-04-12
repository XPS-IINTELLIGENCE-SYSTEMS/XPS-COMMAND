import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OperatorSignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/admin-panel", { replace: true });
  }, [navigate]);

  return null;
}