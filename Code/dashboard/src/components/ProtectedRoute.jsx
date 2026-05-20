import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

function ProtectedRoute({ children }) {
  // If no user is logged in, redirect to login
  if (!auth.currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;