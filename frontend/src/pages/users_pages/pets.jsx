import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, PlusCircle, X, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import api, { mediaUrl } from '../../services/api';

const Pets = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [petSearch, setPetSearch] = useState('');

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

  const loadPets = useCallback(async () => {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setPets([]);
      return;
    }
    try {
      const { data } = await api.get('/pets/');
      const list = Array.isArray(data) ? data : data?.results || [];
      setPets(list);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const resetForm = () => {
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
    setSubmitError(null);
    setEditingPetId(null);
  };

  const openEditPet = (p) => {
    setEditingPetId(p.id);
    setFormData({
      image: null,
      uid: p.uid || '',
      name: p.name || '',
      address: p.address || '',
      species: (p.species || '').toLowerCase() === 'chien' ? 'chien' : (p.species || '').toLowerCase() === 'chat' ? 'chat' : (p.species || '').toLowerCase() === 'oiseau' ? 'oiseau' : (p.species || '').toLowerCase() === 'autre' ? 'autre' : '',
      gender: p.gender === 'Mâle' ? 'male' : p.gender === 'Femelle' ? 'female' : '',
      sterilized: p.sterilized === 'Oui' ? 'oui' : p.sterilized === 'Non' ? 'non' : '',
      birthDate: p.birth_date || '',
      vaccines: p.vaccines && String(p.vaccines).includes('jour') ? 'oui' : p.vaccines ? 'non' : '',
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Supprimer cet animal ?')) return;
    try {
      await api.delete(`/pets/${id}/`);
      await loadPets();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Suppression impossible.';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleAddAnimal = async () => {
    setSubmitError(null);
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!formData.name?.trim()) {
      setSubmitError('Le nom de l’animal est obligatoire.');
      return;
    }
    const fd = new FormData();
    fd.append('name', formData.name.trim());
    if (formData.uid) fd.append('uid', formData.uid);
    if (formData.address) fd.append('address', formData.address);
    if (formData.species) fd.append('species', formData.species);
    if (formData.gender) fd.append('gender', formData.gender === 'male' ? 'Mâle' : formData.gender === 'female' ? 'Femelle' : formData.gender);
    if (formData.sterilized) fd.append('sterilized', formData.sterilized === 'oui' ? 'Oui' : 'Non');
    if (formData.birthDate) fd.append('birth_date', formData.birthDate);
    if (formData.vaccines) fd.append('vaccines', formData.vaccines === 'oui' ? 'À jour' : 'Non renseigné');
    if (formData.image instanceof File) fd.append('photo', formData.image);
    try {
      if (editingPetId) {
        await api.patch(`/pets/${editingPetId}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/pets/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setIsModalOpen(false);
      resetForm();
      await loadPets();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Impossible d’enregistrer l’animal.';
      setSubmitError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const filteredPets = pets.filter((p) => {
    const q = petSearch.trim().toLowerCase();
    if (!q) return true;
    return `${p.name || ''} ${p.species || ''} ${p.uid || ''}`.toLowerCase().includes(q);
  });

  const imagePreviewUrl = useMemo(() => {
    if (formData.image instanceof File) return URL.createObjectURL(formData.image);
    return null;
  }, [formData.image]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  return (
    <Layout >
     

      <div className="container mx-auto p-4">
       

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Plus className="h-16 w-16 text-primary" strokeWidth={2} />
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-8 text-center">
          Identifiant d'animal de compagnie
        </h1>

        {/* Boutons d'action */}
        <div className="flex justify-center space-x-4 mb-8 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/product')}
            className="px-6 py-3 rounded-xl flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
          >
            <ShoppingCart className="w-5 h-5" />
            Acheter un identifiant
          </button>
          <button
            type="button"
            onClick={() => searchInputRef.current?.focus()}
            className="px-6 py-3 rounded-xl flex items-center gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors duration-300"
          >
            <Search className="w-5 h-5" />
            Rechercher un animal
          </button>
        </div>

        <div className="max-w-md mx-auto mb-6">
          <label className="sr-only" htmlFor="pet-search">Rechercher parmi mes animaux</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              id="pet-search"
              type="search"
              value={petSearch}
              onChange={(e) => setPetSearch(e.target.value)}
              placeholder="Filtrer par nom, espèce ou UID…"
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-dark-accent bg-white dark:bg-dark-card text-gray-800 dark:text-dark-text"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : pets.length > 0 ? (
          <div className="max-w-2xl mx-auto mb-12 grid gap-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Mes animaux</h2>
            {filteredPets.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">Aucun animal ne correspond à la recherche.</p>
            ) : (
            filteredPets.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-dark-accent bg-white dark:bg-dark-card p-3"
              >
                {p.photo ? (
                  <img src={mediaUrl(p.photo)} alt="" className="h-14 w-14 rounded-md object-cover shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-md bg-gray-200 dark:bg-dark-accent shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-dark-text">{p.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {[p.species, p.gender].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEditPet(p)}
                    className="p-2 rounded-lg text-primary hover:bg-purple-50 dark:hover:bg-gray-700"
                    aria-label="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePet(p.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        ) : (
          <p className="text-center mb-16 max-w-sm mx-auto text-gray-600 dark:text-gray-400">
            Vous n&apos;avez actuellement aucun animal de compagnie enregistré. Connectez-vous pour en ajouter.
          </p>
        )}

        {/* Bouton d'ajout */}
        <button
          className="rounded-full p-4 fixed bottom-8 right-8 shadow-lg bg-primary text-white hover:bg-primary-dark transition-colors duration-300"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="w-8 h-8" />
        </button>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto scrollbar-rounded">
              {/* Bouton de fermeture */}
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>

              {/* En-tête du modal */}
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">
                {editingPetId ? 'Modifier un animal' : 'Ajouter un animal'}
              </h2>
              {submitError && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">{submitError}</p>
              )}

              {/* Formulaire */}
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
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
                  {editingPetId ? 'Enregistrer les modifications' : 'Ajouter un animal'}
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