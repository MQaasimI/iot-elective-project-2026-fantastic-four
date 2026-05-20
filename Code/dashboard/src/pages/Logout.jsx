import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Loader2, CheckCircle, LogOut } from "lucide-react";

function Logout() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("confirm"); // 'confirm' | 'logging_out' | 'success'

  const handleConfirm = async () => {
    setStatus("logging_out");
    try {
      await signOut(auth);
      setStatus("success");
      
      // Increased delay to 3 seconds before sending them to the login screen
      setTimeout(() => {
        navigate("/"); 
      }, 3000);
    } catch (error) {
      console.error("Error logging out:", error);
      // Fallback redirect just in case it fails
      navigate("/");
    }
  };

  const handleCancel = () => {
    // navigate(-1) safely takes them back to the exact dashboard page they were just on
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-white">
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-2xl p-8 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
        
        {status === "confirm" && (
          <>
            <div className="bg-red-500/10 p-4 rounded-full mb-6">
              <LogOut size={40} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">Sign Out</h1>
            <p className="text-sm text-zinc-400 mb-8">
              Are you sure you want to log out of your account?
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={handleCancel}
                className="flex-1 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-white font-semibold py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                Yes, Log out
              </button>
            </div>
          </>
        )}

        {status === "logging_out" && (
          <>
            <Loader2 size={48} className="text-orange-500 animate-spin mb-6" />
            <h1 className="text-xl font-bold mb-2">Signing Out</h1>
            <p className="text-sm text-zinc-400">Securely closing your session...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} className="text-green-500 mb-6" />
            <h1 className="text-xl font-bold mb-2">Logged Out Successfully</h1>
            <p className="text-sm text-zinc-400">You will be redirected shortly...</p>
          </>
        )}

      </div>
    </div>
  );
}

export default Logout;