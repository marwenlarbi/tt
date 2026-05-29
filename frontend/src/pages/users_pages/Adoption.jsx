import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, PlusCircle, X, Upload, Edit3, Trash2 } from "lucide-react";
import clsx from "clsx";
import Layout from "../../components/Layout";
import PageSpinner from "../../components/PageSpinner";
import api, { mediaUrl } from "../../services/api";

// AnimalCard Component
const AnimalCard = ({ animal, onClick }) => {
  return (
    <div
      className="border rounded-lg p-4 shadow-md bg-white dark:bg-dark-card text-gray-800 dark:text-dark-text transition-colors duration-200 cursor-pointer"
      onClick={onClick}
    >
      {animal.image && (
        <img
          src={animal.image}
          alt={animal.name}
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}
      <h2 className="text-lg font-semibold">{animal.name}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">{animal.description}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500 italic">{animal.type}</p>
    </div>
  );
};

// AddAnimalForm Component (used for add + edit)
const AddAnimalForm = ({ onAddAnimal, onClose, initialData = null, onUpdateAnimal = null }) => {
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [history, setHistory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [species, setSpecies] = useState("");
  const [gender, setGender] = useState("Mâle");
  const [sterilized, setSterilized] = useState("Non");
  const [vaccinated, setVaccinated] = useState("Oui");
  const [availability, setAvailability] = useState("Oui");
  const [birthDate, setBirthDate] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [clearImage, setClearImage] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setName(initialData.name || "");
    setHistory(initialData.description || "");
    setAddress(initialData.address || "");
    setPhone(initialData.phone || "");
    setSpecies(initialData.type || "");
    setGender(initialData.gender || "Mâle");
    setSterilized(initialData.sterilized || "Non");
    setVaccinated(initialData.vaccinated || "Oui");
    setAvailability(initialData.availability || "Oui");
    setBirthDate(initialData.birthDate || "");
    setImagePreview(initialData.image || null);
    setImageFile(null);
    setClearImage(false);
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    const newAnimal = {
      name,
      type: species,
      description: history,
      image: imagePreview || null,
      imageFile,
      clearImage,
      address,
      phone,
      gender,
      sterilized,
      vaccinated,
      availability,
      birthDate,
    };
    try {
      if (initialData && onUpdateAnimal) {
        await onUpdateAnimal(initialData.id, newAnimal);
      } else {
        await onAddAnimal(newAnimal);
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message;
      setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg || "Échec de l’envoi."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setClearImage(false);
    }
  };

  const handleRemoveImage = (e) => {
    e && e.preventDefault();
    setImageFile(null);
    setImagePreview(null);
    setClearImage(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {submitError}
        </p>
      )}
      {/* Image Upload */}
      <div className="flex flex-col items-center">
        <div className="w-full h-32 bg-gray-300 dark:bg-dark-accent rounded-md flex items-center justify-center">
          {imagePreview ? (
            <div className="w-full h-full">
              <img
                src={imagePreview}
                alt="Uploaded animal"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ) : (
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400 mt-1">Uploader une image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {imagePreview && (
          <div className="mt-2 flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-1 bg-secondary dark:bg-dark-accent rounded cursor-pointer text-sm">
              <Upload className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span>Remplacer</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm"
            >
              Supprimer l'image
            </button>
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <input
          type="text"
          placeholder="Nom de l'animal de compagnie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border p-2 rounded bg-gray-200 dark:bg-dark-accent text-gray-800 dark:text-dark-text border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* History */}
      <div>
        <textarea
          placeholder="Histoire de l'animal de compagnie"
          value={history}
          onChange={(e) => setHistory(e.target.value)}
          required
          className="w-full border p-2 rounded bg-gray-200 dark:bg-dark-accent text-gray-800 dark:text-dark-text border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          rows="3"
        />
      </div>

      {/* Address */}
      <div>
        <input
          type="text"
          placeholder="Adresse de l'animal de compagnie"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="w-full border p-2 rounded bg-gray-200 dark:bg-dark-accent text-gray-800 dark:text-dark-text border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Phone Number */}
      <div>
        <input
          type="tel"
          placeholder="Numéro de téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full border p-2 rounded bg-gray-200 dark:bg-dark-accent text-gray-800 dark:text-dark-text border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      

      {/* Species */}
      <div>
        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          required
          className="w-full border p-2 rounded bg-gray-200 dark:bg-dark-accent text-gray-800 dark:text-dark-text border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="" disabled>
            Espèce
          </option>
          <option value="Chien">Chien</option>
          <option value="Chat">Chat</option>
          <option value="Oiseau">Oiseau</option>
          <option value="Lapin">Lapin</option>
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Le genre
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="Mâle"
              checked={gender === "Mâle"}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2 text-primary focus:ring-primary"
            />
            Mâle
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="Femelle"
              checked={gender === "Femelle"}
              onChange={(e) => setGender(e.target.value)}
              className="mr-2 text-primary focus:ring-primary"
            />
            Femelle
          </label>
        </div>
      </div>

      {/* Sterilized */}
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Stérilisé
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="sterilized"
              value="Oui"
              checked={sterilized === "Oui"}
              onChange={(e) => setSterilized(e.target.value)}
              className="mr-2 text-primary focus:ring-primary"
            />
            Oui
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="sterilized"
              value="Non"
              checked={sterilized === "Non"}
              onChange={(e) => setSterilized(e.target.value)}
              className="mr-2 text-primary focus:ring-primary"
            />
            Non
          </label>
        </div>
      </div>

      {/* Vaccinated */}
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Vaccins
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="vaccinated"
              value="Oui"
              checked={vaccinated === "Oui"}
              onChange={(e) => setVaccinated(e.target.value)}
              className="mr-2 text-primary focus:ring-primary"
            />
            Oui
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="vaccinated"
              value="Non"
              checked={vaccinated === "Non"}
              onChange={(e) => setVaccinated(e.target.value)}
              className="mr-2 text-primary focus:ring-primary"
            />
            Non
          </label>
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Disponibilité
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="availability"
              value="Oui"
              checked={availability === "Oui"}
              onChange={(e) => setAvailability(e.target.value)}
              className="mr-2 text-primary focus:ring-primary"
            />
            Oui
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="availability"
              value="Non"
              checked={availability === "Non"}
              onChange={(e) => setAvailability(e.target.value)}
              className="mr-2 text-primary focus:ring-primary"
            />
            Non
          </label>
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          className="w-full border p-2 rounded bg-gray-200 dark:bg-dark-accent text-gray-800 dark:text-dark-text border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting
            ? "Envoi…"
            : initialData
            ? "Enregistrer les modifications"
            : "Ajouter un animal"}
        </button>
      </div>
    </form>
  );
};

// AnimalDetailsModal Component
const AnimalDetailsModal = ({ animal, onClose, onEdit, onDelete, currentUser }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-dark-card rounded-lg p-4 max-w-md w-full relative max-h-[90vh] overflow-y-auto scrollbar-rounded"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Buttons moved to modal footer for better UX */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white"
          aria-label="Fermer"
        >
          <X className="h-6 w-6" />
        </button>
        {animal.image && (
          <img
            src={animal.image}
            alt={animal.name}
            className="w-full h-64 object-cover rounded mb-4"
          />
        )}
        <div className="text-gray-800 dark:text-dark-text">
          <h3 className="text-xl font-semibold mb-2">
            {animal.name} <span className="text-primary">✔</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{animal.description}</p>
          <h4 className="text-lg font-semibold mb-2">Détails de l'animal</h4>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Espèce:</span> {animal.type}
            </p>
            <p>
              <span className="font-medium">Genre:</span> {animal.gender || "Non spécifié"}
            </p>
            <p>
              <span className="font-medium">Date de naissance:</span>{" "}
              {animal.birthDate || "Non spécifiée"}
            </p>
            <p>
              <span className="font-medium">Vaccins:</span> {animal.vaccinated || "Non spécifié"}
            </p>
            <p>
              <span className="font-medium">Stérilisé:</span> {animal.sterilized || "Non spécifié"}
            </p>
            <p>
              <span className="font-medium">Disponibilité:</span>{" "}
              {animal.availability || "Non spécifiée"}
            </p>
            <p>
              <span className="font-medium">Adresse:</span> {animal.address || "Non spécifiée"}
            </p>
            <p>
              <span className="font-medium">Téléphone:</span> {animal.phone || "Non spécifié"}
            </p>
          </div>
        </div>

        {/* Footer with owner actions */}
        <div className="mt-4 flex justify-end gap-2">
          {currentUser && currentUser.id === animal.ownerId && (
            <>
              <button
                onClick={() => onEdit && onEdit(animal)}
                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-2"
                aria-label="Modifier"
              >
                <Edit3 className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => onDelete && onDelete(animal.id)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function Adoption() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editAnimal, setEditAnimal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const animalsPerPage = 6;

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/adoption/listings/");
      const list = Array.isArray(data) ? data : data?.results || [];
      const mapped = list.map((l) => ({
        id: l.id,
        name: l.name,
        type: l.species || "—",
        description: l.description,
        image: l.image ? mediaUrl(l.image) : null,
        address: l.address,
        phone: l.phone,
        gender: l.gender,
        sterilized: l.sterilized,
        vaccinated: l.vaccinated,
        availability: l.availability,
        birthDate: l.birth_date,
        ownerId: l.owner,
      }));
      setAnimals(mapped);
    } catch {
      setError("Impossible de charger les annonces. Vérifiez que le serveur est démarré.");
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  // Load current user from localStorage (used to decide owner actions)
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      setCurrentUser(u);
    } catch (e) {
      setCurrentUser(null);
    }
  }, []);


  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleAddAnimal = async (newAnimal) => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      throw new Error("Connexion requise.");
    }
    const fd = new FormData();
    fd.append("name", newAnimal.name.trim());
    fd.append("description", (newAnimal.description || "").trim());
    if (newAnimal.type) fd.append("species", newAnimal.type);
    if (newAnimal.address) fd.append("address", newAnimal.address.trim());
    if (newAnimal.phone) fd.append("phone", newAnimal.phone.trim());
    if (newAnimal.gender) fd.append("gender", newAnimal.gender);
    if (newAnimal.sterilized) fd.append("sterilized", newAnimal.sterilized);
    if (newAnimal.vaccinated) fd.append("vaccinated", newAnimal.vaccinated);
    if (newAnimal.availability) fd.append("availability", newAnimal.availability);
    if (newAnimal.birthDate) fd.append("birth_date", newAnimal.birthDate);
    if (newAnimal.imageFile instanceof File) fd.append("image", newAnimal.imageFile);
    await api.post("/adoption/listings/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchAnimals();
  };

  const handleAnimalClick = (animal) => {
    setSelectedAnimal(animal);
  };

  const handleOpenEditModal = (animal) => {
    // animal comes from mapped list — build initialData compatible with AddAnimalForm
    setEditAnimal({
      id: animal.id,
      name: animal.name,
      description: animal.description,
      type: animal.type,
      address: animal.address,
      phone: animal.phone,
      gender: animal.gender,
      sterilized: animal.sterilized,
      vaccinated: animal.vaccinated,
      availability: animal.availability,
      birthDate: animal.birthDate,
      image: animal.image,
      ownerId: animal.ownerId,
    });
    setSelectedAnimal(null);
    setEditOpen(true);
  };

  const handleUpdateAnimal = async (id, updatedAnimal) => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      throw new Error("Connexion requise.");
    }

    const fd = new FormData();
    if (updatedAnimal.name) fd.append("name", updatedAnimal.name.trim());
    fd.append("description", (updatedAnimal.description || "").trim());
    if (updatedAnimal.type) fd.append("species", updatedAnimal.type);
    if (updatedAnimal.address) fd.append("address", updatedAnimal.address.trim());
    if (updatedAnimal.phone) fd.append("phone", updatedAnimal.phone.trim());
    if (updatedAnimal.gender) fd.append("gender", updatedAnimal.gender);
    if (updatedAnimal.sterilized) fd.append("sterilized", updatedAnimal.sterilized);
    if (updatedAnimal.vaccinated) fd.append("vaccinated", updatedAnimal.vaccinated);
    if (updatedAnimal.availability) fd.append("availability", updatedAnimal.availability);
    if (updatedAnimal.birthDate) fd.append("birth_date", updatedAnimal.birthDate);
    if (updatedAnimal.clearImage) fd.append("clear_image", "1");
    if (updatedAnimal.imageFile instanceof File) fd.append("image", updatedAnimal.imageFile);

    await api.patch(`/adoption/listings/${id}/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchAnimals();
    setEditOpen(false);
  };

  const handleDeleteAnimal = async (id) => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!window.confirm("Confirmer la suppression de cette annonce ?")) return;
    try {
      await api.delete(`/adoption/listings/${id}/`);
      await fetchAnimals();
      setSelectedAnimal(null);
      setEditOpen(false);
    } catch (err) {
      // rethrow so AddAnimalForm / UI can surface error if needed
      throw err;
    }
  };

  const closeDetailsModal = () => {
    setSelectedAnimal(null);
  };

  const filteredAnimals = animals.filter((animal) => {
    const matchesType = selectedType ? animal.type === selectedType : true;
    const matchesSearch = animal.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAnimals.length / animalsPerPage);
  const startIndex = (currentPage - 1) * animalsPerPage;
  const currentAnimals = filteredAnimals.slice(startIndex, startIndex + animalsPerPage);

  const renderPaginationButtons = () => {
    return Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        className={clsx(
          "px-3 py-1 rounded",
          currentPage === i + 1
            ? "bg-primary text-white"
            : "bg-secondary dark:bg-dark-accent text-gray-700 dark:text-dark-text hover:bg-primary hover:text-white"
        )}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </button>
    ));
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-screen font-sans bg-secondary dark:bg-dark-gray transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-dark-card p-4 shadow-md flex items-center justify-between">
          <div className="container mx-auto flex items-center gap-4 flex-1">
            <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Recherche"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <MapPin className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
        </header>

        {/* Add Animal Button */}
        <div className="container mx-auto p-4 flex justify-end">
          <button
            className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark"
            onClick={() => setAddOpen(true)}
            aria-label="Ajouter un animal"
          >
            <PlusCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="container mx-auto p-4 flex gap-2 overflow-x-auto">
          {["Tous", "Chien", "Chat", "Oiseau", "Lapin"].map((type) => (
            <button
              key={type}
              className={clsx(
                "px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap",
                selectedType === type || (type === "Tous" && selectedType === null)
                  ? "bg-primary text-white"
                  : "bg-secondary dark:bg-dark-accent text-gray-700 dark:text-dark-text hover:bg-primary hover:text-white"
              )}
              onClick={() => handleTypeChange(type === "Tous" ? null : type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">
              Animaux à adopter
            </h2>

            {loading && <PageSpinner compact className="!py-8" />}
            {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAnimals.length > 0 ? (
                currentAnimals.map((animal) => (
                  <AnimalCard 
                    key={animal.id} 
                    animal={animal} 
                    onClick={() => handleAnimalClick(animal)} 
                  />
                ))
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">
                  Aucun animal trouvé.
                </p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 flex-wrap gap-2">
                {renderPaginationButtons()}
              </div>
            )}
          </div>
        </main>

        {/* Animal Details Modal */}
        {selectedAnimal && (
          <AnimalDetailsModal
            animal={selectedAnimal}
            onClose={closeDetailsModal}
            onEdit={(a) => handleOpenEditModal(a)}
            onDelete={(id) => handleDeleteAnimal(id)}
            currentUser={currentUser}
          />
        )}

        {/* Modal for adding animal */}
        {addOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setAddOpen(false)}
            role="presentation"
          >
            <div
              className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto scrollbar-rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="absolute top-3 right-3 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Fermer"
              >
                <X className="h-6 w-6 text-gray-800 dark:text-dark-text" />
              </button>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text">
                Ajouter un animal
              </h3>
              <AddAnimalForm
                onAddAnimal={handleAddAnimal}
                onClose={() => setAddOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Modal for editing animal */}
        {editOpen && editAnimal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={() => setEditOpen(false)}
            role="presentation"
          >
            <div
              className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto scrollbar-rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="absolute top-3 right-3 p-2 rounded bg-primary text-white hover:bg-primary-dark"
                aria-label="Fermer"
              >
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text">
                Modifier l'annonce
              </h3>
              <AddAnimalForm
                initialData={editAnimal}
                onUpdateAnimal={handleUpdateAnimal}
                onClose={() => setEditOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}