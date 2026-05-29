import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/auth/password-reset/request/", { email });
      setMessage("Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.");
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setMessage(Array.isArray(detail) ? detail.join(" ") : (detail || "Erreur lors de l'envoi du lien."));
    } finally {
      setLoading(false);
    }
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
                disabled={loading}
                className="p-4 mt-2 w-full bg-[#ff6b6b] text-white rounded-md cursor-pointer transition duration-300 ease-in-out hover:bg-[#ff4949]"
              >
                {loading ? "Envoi..." : "Réinitialiser"}
              </button>
            </form>
            {message ? <p className="mt-4 text-center text-sm text-white">{message}</p> : null}
            <p className="mt-4 text-center text-sm text-white">
              Retour à{" "}
              <span
                onClick={() => navigate("/login")}
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
