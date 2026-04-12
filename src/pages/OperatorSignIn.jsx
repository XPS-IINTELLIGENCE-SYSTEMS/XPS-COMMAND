import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OperatorSignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/custom-login", { replace: true });
  }, [navigate]);

  return null;
}