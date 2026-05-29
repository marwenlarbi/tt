import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Heart, Users, Shield, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Accueil = () => {
  const navigate = useNavigate();
  const [landingStats, setLandingStats] = useState({
    pets: null,
    vets: null,
    users: null,
  });

  useEffect(() => {
    let cancelled = false;
    api
      .get('/auth/landing-stats/')
      .then((res) => {
        if (cancelled) return;
        const d = res.data || {};
        setLandingStats({
          pets: d.pets_registered ?? 0,
          vets: d.vets_verified ?? 0,
          users: d.users_total ?? 0,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setLandingStats({ pets: null, vets: null, users: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatStat = (value) => {
    if (value == null) return '…';
    return Number(value).toLocaleString('fr-FR');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const features = [
    {
      icon: <PawPrint className="w-8 h-8 text-white" />,
      title: "Gestion d'animaux",
      description: "Enregistrez et gérez les informations de vos animaux de compagnie"
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Adoption",
      description: "Trouvez votre compagnon idéal ou aidez un animal à trouver une famille"
    },
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Communauté",
      description: "Connectez-vous avec d'autres propriétaires d'animaux"
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: "Vétérinaires",
      description: "Accédez à des consultations avec des vétérinaires qualifiés"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Cheebo
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <button 
              onClick={() => handleNavigation('/login')} 
              className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
            >
              Connexion
            </button>
            <button 
              onClick={() => handleNavigation('/signup')} 
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              S'inscrire
            </button>
          </div>

          
          
        </div>

       
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            {/* Animated Logo */}
            <div className="mb-8">
              <svg className="w-full max-w-2xl h-48 mx-auto" viewBox="0 0 800 200">
                <defs>
                  <style>{`
                    @import url("https://fonts.googleapis.com/css2?family=Russo+One&display=swap");
                    .animated-text {
                      font-family: "Russo One", sans-serif;
                      font-size: 80px;
                      animation: stroke 5s infinite alternate;
                      stroke-width: 2;
                      stroke: #8657ff;
                    }
                    @keyframes stroke {
                      0% {
                        fill: rgba(134,87,255,0);
                        stroke: rgba(134,87,255,1);
                        stroke-dashoffset: 25%;
                        stroke-dasharray: 0 50%;
                        stroke-width: 2;
                      }
                      70% {
                        fill: rgba(134,87,255,0);
                        stroke: rgba(134,87,255,1);
                      }
                      80% {
                        fill: rgba(134,87,255,0);
                        stroke: rgba(134,87,255,1);
                        stroke-width: 3;
                      }
                      100% {
                        fill: rgba(134,87,255,1);
                        stroke: rgba(134,87,255,0);
                        stroke-dashoffset: -25%;
                        stroke-dasharray: 50% 0;
                        stroke-width: 0;
                      }
                    }
                  `}</style>
                </defs>
                <text
                  x="50%"
                  y="50%"
                  dy=".35em"
                  textAnchor="middle"
                  className="animated-text"
                >
                  Cheebo
                </text>
              </svg>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Votre compagnon digital pour le
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}bien-être animal
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Rejoignez la première plateforme dédiée aux amoureux des animaux. 
              Gérez vos compagnons, trouvez des vétérinaires, adoptez et partagez votre passion !
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={() => handleNavigation('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 group"
              >
                <span>Commencer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => handleNavigation('/login')}
                className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300 font-semibold"
              >
                Se connecter
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatStat(landingStats.pets)}
                </div>
                <div className="text-gray-600">Animaux enregistrés</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatStat(landingStats.vets)}
                </div>
                <div className="text-gray-600">Vétérinaires partenaires</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatStat(landingStats.users)}
                </div>
                <div className="text-gray-600">Nombre d&apos;utilisateurs</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Tout ce dont vous avez besoin pour vos animaux
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez nos fonctionnalités conçues pour simplifier la vie avec vos compagnons
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à commencer l'aventure ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez Cheebo aujourd'hui et découvrez une nouvelle façon de prendre soin de vos animaux
            </p>
            <button 
              onClick={() => handleNavigation('/signup')}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 mx-auto group"
            >
              <span>Créer un compte </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <PawPrint className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold">Cheebo</div>
              </div>
              <p className="text-gray-400 mb-4">
                La plateforme qui connecte les amoureux des animaux et facilite le bien-être de nos compagnons à quatre pattes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors text-left">À propos</button></li>
                <li><button className="hover:text-white transition-colors text-left">Services</button></li>
                <li><button className="hover:text-white transition-colors text-left">Contact</button></li>
                <li><button className="hover:text-white transition-colors text-left">FAQ</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors text-left">Centre d'aide</button></li>
                <li><button className="hover:text-white transition-colors text-left">Politique de confidentialité</button></li>
                <li><button className="hover:text-white transition-colors text-left">Conditions d'utilisation</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Cheebo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Accueil;