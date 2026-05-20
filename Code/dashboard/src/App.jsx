import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Logs from "./pages/Logs";
import Analytics from "./pages/Analytics";
import Logout from "./pages/Logout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={<Login />} />
        
        {/* LOGOUT ROUTE */}
        <Route path="/logout" element={<Logout />} />

        {/* PROTECTED DASHBOARD ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/students" 
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/logs" 
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;