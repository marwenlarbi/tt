import { Moon, Sun, User, Home, PawPrint, Store, Stethoscope } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#8657ff] dark:bg-[#8657ff] shadow-md transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center px-4 py-4 md:px-10 lg:px-48">
        
        <button onClick={() => handleNavigation('/profile')} aria-label="Accéder au profil utilisateur">
          <User className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
        </button>

        {/* Icônes de navigation */}
        <div className="flex gap-4 md:gap-8">
          <button onClick={() => handleNavigation('/home')} aria-label="Accéder à l'accueil">
            <Home className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
          </button>
          <button onClick={() => handleNavigation('/pets')} aria-label="Voir les animaux">
            <PawPrint className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
          </button>
          <button onClick={() => handleNavigation('/product')} aria-label="Voir la boutique">
            <Store className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
          </button>
          <button onClick={() => handleNavigation('/vet')} aria-label="Consulter le vétérinaire">
            <Stethoscope className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
          </button>
        </div>

        {/* Mode sombre */}
        <div className="flex items-center">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-opacity-30 hover:bg-opacity-50 bg-gray-600 hover:bg-gray-200 dark:hover:bg-primary-dark transition-colors duration-300"
            aria-label={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {darkMode ? (
              <Sun className="w-6 h-6 text-yellow-400 hover:text-yellow-300 transition-colors duration-300" />
            ) : (
              <Moon className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
};
