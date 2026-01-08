import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext/AuthProvider";
import { useEffect, type JSX } from "react";

type Props = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: Props) {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return user ? children : null;
}
