import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation frontend rapide
    if (!role) {
      setErrorMsg('Veuillez choisir un rôle (Propriétaire ou Vétérinaire)');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg('Les mots de passe ne correspondent pas');
      return;
    }

    const userData = {
      username: username.trim() || email.trim(), // si pas de username, utilise email
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password: password,
      password_confirm: passwordConfirm,
      role: role,
    };

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // On affiche le message le plus pertinent du backend
        const backendError =
          data.error ||
          data.detail ||
          data.email?.[0] ||
          data.username?.[0] ||
          data.password?.[0] ||
          data.role?.[0] ||
          data.non_field_errors?.[0] ||
          'Erreur lors de l\'inscription';

        throw new Error(backendError);
      }

      // Succès
      console.log('Inscription réussie →', data);

      // Stockage du token JWT (si ton backend en renvoie un)
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
      }

      alert('Compte créé avec succès !');
      navigate('/login');

    } catch (err) {
      console.error('Erreur inscription :', err);
      setErrorMsg(err.message || 'Une erreur est survenue. Réessayez.');
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
          style={{ width: '200px', height: '150px', marginBottom: '40px' }}
        />

        <main className="flex-grow flex items-center justify-center">
          <div className="bg-[#8657ff] p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-white text-2xl text-center mb-6">S'inscrire</h2>

            {errorMsg && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nouveau champ username */}
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                required
              />

              <input
                type="text"
                placeholder="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                required
              />

              <input
                type="text"
                placeholder="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                required
              />

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

              {/* Nouveau champ confirmation */}
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                required
              />

              <div className="mb-6">
                <label className="block text-white mb-3 text-lg">Vous êtes :</label>
                <div className="flex justify-center gap-8">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={role === 'user'}
                      onChange={(e) => setRole(e.target.value)}
                      className="mr-2 w-5 h-5"
                      required
                    />
                    <span className="text-white text-lg">Propriétaire d'animal</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="vet"
                      checked={role === 'vet'}
                      onChange={(e) => setRole(e.target.value)}
                      className="mr-2 w-5 h-5"
                    />
                    <span className="text-white text-lg">Vétérinaire</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`p-4 mt-2 w-full rounded-md text-white transition duration-300 ease-in-out ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-[#ff6b6b] hover:bg-[#ff4949] cursor-pointer'
                }`}
              >
                {loading ? 'Inscription en cours...' : "S'inscrire"}
              </button>
            </form>

            <p className="mt-6 text-center text-white">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-white no-underline hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Signup;