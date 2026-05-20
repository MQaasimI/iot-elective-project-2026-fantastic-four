import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");

    } catch (err) {

      setError("Incorrect email or password");

    }

  };

  return (

    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-[#111113] border border-[#1c1c1f] rounded-3xl p-8">

        {/* TITLE */}

        <div className="mb-8 text-center">

          <h1 className="text-4xl font-bold text-white mb-2">

            Smart<span className="text-orange-400">Attend</span>

          </h1>

          <p className="text-zinc-500">
            Lecturer Portal Login
          </p>

        </div>

        {/* FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="mb-5">

            <label className="block text-sm text-zinc-400 mb-2">
              CPUT Email
            </label>

            <input
              type="email"
              placeholder="lecturer@cput.ac.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400 transition"
            />

          </div>

          {/* PASSWORD */}

          <div className="mb-5">

            <label className="block text-sm text-zinc-400 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-white outline-none focus:border-orange-400 transition"
            />

          </div>

          {/* ERROR */}

          {error && (

            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3">

              {error}

            </div>

          )}

          {/* BUTTON */}

          <button
            type="submit"
            className="w-full bg-orange-400 hover:bg-orange-300 transition text-black font-semibold py-3 rounded-xl"
          >

            Login

          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;