import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const ResetPasswordConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const uid = useMemo(() => searchParams.get("uid") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uid || !token) {
      setMessage("Lien invalide. Vérifiez le lien reçu par email.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/auth/password-reset/confirm/", {
        uid,
        token,
        new_password: newPassword,
      });
      setMessage(res?.data?.detail || "Mot de passe mis à jour.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setMessage(Array.isArray(detail) ? detail.join(" ") : (detail || "Erreur lors de la mise à jour du mot de passe."));
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
              Nouveau mot de passe
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-black"
                required
              />
              <input
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-black"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="p-4 mt-2 w-full bg-[#ff6b6b] text-white rounded-md cursor-pointer transition duration-300 ease-in-out hover:bg-[#ff4949] disabled:opacity-70"
              >
                {loading ? "Validation..." : "Enregistrer"}
              </button>
            </form>

            {message ? <p className="mt-4 text-center text-sm">{message}</p> : null}

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

export default ResetPasswordConfirm;
