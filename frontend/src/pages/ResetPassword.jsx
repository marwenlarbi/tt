import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();

    // Logique de reset (ex: appel API, etc.)
    alert(`Un lien de réinitialisation a été envoyé à ${email}`);
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#8657ff] text-white">
      <div className="container mx-auto p-4 max-w-md">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="mx-auto mb-4"
          style={{ width: "200px", height: "150px", marginBottom: "40px" }}
        />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full">
            <h2 className="text-[#ffffff] text-2xl text-center mb-6">
              Réinitialiser le mot de passe
            </h2>
            <form onSubmit={handleReset}>
              <input
                type="email"
                placeholder="Entrez votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-black"
                required
              />
              <button
                type="submit"
                className="p-4 mt-2 w-full bg-[#ff6b6b] text-white rounded-md cursor-pointer transition duration-300 ease-in-out hover:bg-[#ff4949]"
              >
                Vérifier
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-white">
              Retour à{" "}
              <span
                onClick={() => navigate("/")}
                className="text-white underline cursor-pointer"
              >
                la connexion
              </span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResetPassword;
