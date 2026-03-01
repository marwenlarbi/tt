import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import PrivateChat from './Chat/PrivateChat';
const Layout = ({ children }) => {
  // Récupérer le mode sombre depuis localStorage ou utiliser le thème du système
  const [darkMode, setDarkMode] = useState(() => {
    // Vérifier si window est défini (côté client)
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem("darkMode");
      if (savedDarkMode !== null) {
        return JSON.parse(savedDarkMode);
      } else {
        // Utiliser les préférences du système si aucune préférence n'est enregistrée
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }
    return false;
  });

  useEffect(() => {
    // Appliquer la classe dark au HTML et sauvegarder la préférence
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Sauvegarder la préférence dans localStorage
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    // Ajouter la classe de transition après le chargement initial pour éviter la transition au chargement
    const timer = setTimeout(() => {
      document.documentElement.classList.add('transition-colors');
      document.documentElement.style.setProperty('--transition-duration', '500ms');
    }, 100);

    return () => clearTimeout(timer);
  }, [darkMode]);

  return (
    <div className="flex flex-col min-h-screen">
    <Header darkMode={darkMode} setDarkMode={setDarkMode} />

    <main className="flex-grow pt-16 bg-gray-50 dark:bg-dark-gray text-gray-900 dark:text-dark-text transition-colors duration-300">
      {children}
    </main>

    <Footer darkMode={darkMode} />
    
    {/* Ajouter le chat privé */}
    <PrivateChat />
  </div>
  );
};

export default Layout;
