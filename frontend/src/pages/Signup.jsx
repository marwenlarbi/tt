import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(''); // '' = pas encore choisi

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!role) {
      alert('Veuillez choisir un rôle (Propriétaire ou Vétérinaire)');
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
    };

    console.log('Inscription soumise :', userData);

    // Plus tard → fetch('/api/signup', { method: 'POST', body: JSON.stringify(userData) })
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

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                aria-label="Prénom"
                required
              />

              <input
                type="text"
                placeholder="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                aria-label="Nom"
                required
              />

              <input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                aria-label="Adresse e-mail"
                required
              />

              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-4 mb-4 w-full border border-gray-300 rounded-md shadow-inner text-gray-600"
                aria-label="Mot de passe"
                required
              />

              
              <div className="mb-6">
                <label className="block text-white mb-3 text-lg">
                  Vous êtes :
                </label>
                <div className="flex justify-center gap-8">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="owner"
                      checked={role === 'owner'}
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
                className="p-4 mt-2 w-full bg-[#ff6b6b] text-white rounded-md cursor-pointer transition duration-300 ease-in-out hover:bg-[#ff4949]"
              >
                S'inscrire
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