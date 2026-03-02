import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const loginData = {
      email: email.trim(),
      password: password,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Message d'erreur précis du backend
        const backendError =
          data.detail ||
          data.error ||
          data.non_field_errors?.[0] ||
          data.email?.[0] ||
          data.password?.[0] ||
          "Identifiants incorrects ou serveur indisponible";

        throw new Error(backendError);
      }

      // Succès → stockage des tokens JWT
      localStorage.setItem("access_token", data.tokens?.access);
      localStorage.setItem("refresh_token", data.tokens?.refresh);

      // Stockage optionnel des infos utilisateur
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Connexion réussie !");

      // Redirection selon rôle
      const role = data.user?.role;
      if (role === "owner") {
        navigate("/home");           // ou /profile, /pets, etc.
      } else if (role === "vet") {
        navigate("/Adoption");   // ou /vet/agenda
      } else if (role === "admin") {
        navigate("/admin_pages/dashboard");
      } else {
        navigate("/accueil");            // fallback
      }

    } catch (err) {
      console.error("Erreur connexion :", err);
      setErrorMsg(err.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
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
            <h2 className="text-white text-2xl text-center mb-6">Connexion</h2>

            {errorMsg && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                required
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className={`p-4 mt-2 w-full rounded-md text-white transition duration-300 ease-in-out ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-[#ff6b6b] hover:bg-[#ff4949] cursor-pointer"
                }`}
              >
                {loading ? "Connexion en cours..." : "Connexion"}
              </button>
            </form>

            <button
              onClick={() => navigate("/reset-password")}
              className="text-white mt-2 no-underline hover:underline block text-center"
            >
              Vous avez oublié votre mot de passe ?
            </button>

            <p className="mt-2 text-center text-white">
              Vous n'avez pas de compte ?{" "}
              <Link to="/signup" className="text-white no-underline hover:underline">
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