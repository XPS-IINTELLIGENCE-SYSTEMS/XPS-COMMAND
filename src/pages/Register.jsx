import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// Register page simply redirects to Payment — that's where account creation happens
export default function Register() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/payment", { replace: true });
  }, [navigate]);
  return null;
}