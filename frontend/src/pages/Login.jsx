import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (email === "test@example.com" && password === "password") {
      console.log("Connexion réussie !");
      
    
      navigate("/home");
    }else if  (email === "admin@example.com" && password === "admin123") {
      console.log("Connexion admin réussie !");
      navigate("/admin/dashboard");
    } else {
      alert("Identifiants incorrects !");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#8657ff] text-gray-600">
      <div className="container mx-auto p-4 max-w-md">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="mx-auto mb-4"
          style={{ width: "200px", height: "150px", marginBottom: "40px" }}
        />
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-[#8657ff] p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-[#ffffff] text-2xl text-center mb-6">Connexion</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner"
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner"
                required
              />
              <button
                type="submit"
                className="p-4 mt-2 w-full bg-[#ff6b6b] text-white rounded-md cursor-pointer transition duration-300 ease-in-out hover:bg-[#ff4949]"
              >
                Connexion
              </button>
            </form>

            <button
              onClick={() => navigate("/reset-password")}
              className="text-[#ffffff] mt-2 no-underline hover:underline block text-center"
            >
              Vous avez oublié votre mot de passe ?
            </button>
            <p className="mt-2 text-center text-[#ffffff]">
              Vous n'avez pas de compte ?{" "}
              <Link to="/signup" className="text-[#ffffff] no-underline hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
