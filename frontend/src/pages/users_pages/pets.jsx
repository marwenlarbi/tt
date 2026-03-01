import React, { useState } from 'react';
import { ShoppingCart, Search, PlusCircle, X} from 'lucide-react';
import Layout from '../../components/Layout';

const Pets = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    image: null,
    uid: '',
    name: '',
    address: '',
    species: '',
    gender: '',
    sterilized: '',
    birthDate: '',
    vaccines: '',
  });

 

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleAddAnimal = () => {
    console.log(formData);
    setIsModalOpen(false);
    setFormData({
      image: null,
      uid: '',
      name: '',
      address: '',
      species: '',
      gender: '',
      sterilized: '',
      birthDate: '',
      vaccines: '',
    });
  };

  return (
    <Layout >
     

      <div className="container mx-auto p-4">
       

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <svg
            className="h-16 w-16 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 2v20M2 12h20" />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-8 text-center">
          Identifiant d'animal de compagnie
        </h1>

        {/* Boutons d'action */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            className="px-6 py-3 rounded-xl flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
          >
            <ShoppingCart className="w-5 h-5" />
            Acheter un identifiant
          </button>
          <button
            className="px-6 py-3 rounded-xl flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
          >
            <Search className="w-5 h-5" />
            Rechercher un animal
          </button>
        </div>

        {/* Message pour aucun animal enregistré */}
        <p className="text-center mb-16 max-w-sm text-gray-600 dark:text-gray-400">
          Vous n'avez actuellement aucun animal de compagnie enregistré !
        </p>

        {/* Bouton d'ajout */}
        <button
          className="rounded-full p-4 fixed bottom-8 right-8 shadow-lg bg-primary text-white hover:bg-primary-dark transition-colors duration-300"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="w-8 h-8" />
        </button>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto scrollbar-rounded">
              {/* Bouton de fermeture */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>

              {/* En-tête du modal */}
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">
                Ajouter un animal
              </h2>

              {/* Formulaire */}
              <form className="space-y-4">
                {/* Téléversement d'image */}
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléverser une image
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-gray-700 dark:text-dark-text"
                  />
                  {formData.image && (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Aperçu"
                      className="mt-2 h-20 w-20 rounded-md object-cover"
                    />
                  )}
                </div>

                {/* Identifiant */}
                <div>
                  <label htmlFor="uid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Identifiant de l'animal
                  </label>
                  <input
                    id="uid"
                    name="uid"
                    value={formData.uid}
                    onChange={handleInputChange}
                    placeholder="UID (AA-####-AA)"
                    className="w-full rounded p-2 border border-gray-300 dark:border-dark-accent bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text"
                  />
                </div>

                {/* Nom */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'animal
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nom de l'animal"
                    className="w-full rounded p-2 border border-gray-300 dark:border-dark-accent bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text"
                  />
                </div>

                {/* Adresse */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse de l'animal
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Adresse de l'animal"
                    className="w-full rounded p-2 border border-gray-300 dark:border-dark-accent bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text"
                  />
                </div>

                {/* Espèce */}
                <div>
                  <label htmlFor="species" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Espèce
                  </label>
                  <select
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleInputChange}
                    className="w-full rounded p-2 border border-gray-300 dark:border-dark-accent bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text"
                  >
                    <option value="">Sélectionner une espèce</option>
                    <option value="chien">Chien</option>
                    <option value="chat">Chat</option>
                    <option value="oiseau">Oiseau</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genre</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Mâle
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Femelle
                    </label>
                  </div>
                </div>

                {/* Stérilisé */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stérilisé</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sterilized"
                        value="oui"
                        checked={formData.sterilized === 'oui'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Oui
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sterilized"
                        value="non"
                        checked={formData.sterilized === 'non'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Non
                    </label>
                  </div>
                </div>

                {/* Date de naissance */}
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de naissance
                  </label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full rounded p-2 border border-gray-300 dark:border-dark-accent bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text"
                  />
                </div>

                {/* Vaccins */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vaccins</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vaccines"
                        value="oui"
                        checked={formData.vaccines === 'oui'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Oui
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vaccines"
                        value="non"
                        checked={formData.vaccines === 'non'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Non
                    </label>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="button"
                  className="w-full p-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors duration-300"
                  onClick={handleAddAnimal}
                >
                  Ajouter un animal
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Pets;