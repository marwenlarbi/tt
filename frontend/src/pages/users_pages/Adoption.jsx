import React, { useState, useEffect } from "react";
import { Search, MapPin, PlusCircle, X, Upload } from "lucide-react";
import clsx from "clsx";
import Layout from "../../components/Layout";

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

// AddAnimalForm Component
const AddAnimalForm = ({ onAddAnimal, onClose }) => {
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
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAnimal = {
      id: Date.now(),
      name,
      type: species,
      description: history,
      image: image || null,
      address,
      phone,
      gender,
      sterilized,
      vaccinated,
      availability,
      birthDate,
    };
    onAddAnimal(newAnimal);
    onClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Upload */}
      <div className="flex flex-col items-center">
        <div className="w-full h-32 bg-gray-300 dark:bg-dark-accent rounded-md flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt="Uploaded animal"
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400 mt-1">
                Uploader une image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
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
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark"
        >
          Ajouter un animal
        </button>
      </div>
    </form>
  );
};

// AnimalDetailsModal Component
const AnimalDetailsModal = ({ animal, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-dark-card rounded-lg p-4 max-w-md w-full relative max-h-[90vh] overflow-y-auto scrollbar-rounded">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white"
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
      </div>
    </div>
  );
};

// Main Page Component
export default function Adoption() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const animalsPerPage = 6;

  // Fetch animals
  useEffect(() => {
    const fetchAnimals = async () => {
      setLoading(true);
      try {
        const data = [
          {
            id: 1,
            name: "Milo",
            type: "Chien",
            description: "Adorable et joueur.",
            image: "https://placedog.net/400/300?id=1",
          },
          {
            id: 2,
            name: "Luna",
            type: "Chat",
            description: "Très affectueuse.",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7xwSjANIUf1ZSQRaZ4khBL3Mg_RwJzuQKaA&s",
          },
          {
            id: 3,
            name: "Coco",
            type: "Oiseau",
            description: "Chante tous les matins.",
            image: "data:image/jpeg;base64,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",
          },
          {
            id: 4,
            name: "Bunny",
            type: "Lapin",
            description: "Adore les carottes.",
            image: "data:image/jpeg;base64,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",
          },
          {
            id: 5,
            name: "Rex",
            type: "Chien",
            description: "Garde bien la maison.",
            image: "https://placedog.net/400/300?id=5",
          },
          {
            id: 6,
            name: "Mimi",
            type: "Chat",
            description: "Très calme et propre.",
            image: "data:image/jpeg;base64,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 ",
          },
          {
            id: 7,
            name: "Sky",
            type: "Oiseau",
            description: "Très curieux.",
            image: "https://cdn.pixabay.com/photo/2016/03/27/22/22/bird-1284512_1280.jpg",
          },
        ];
        setAnimals(data);
      } catch {
        setError("Impossible de charger les animaux.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleAddAnimal = (newAnimal) => {
    setAnimals((prev) => [...prev, newAnimal]);
  };

  const handleAnimalClick = (animal) => {
    setSelectedAnimal(animal);
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
            onClick={() => setIsModalOpen(true)}
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

            {loading && <p className="text-gray-800 dark:text-dark-text">Chargement...</p>}
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
          <AnimalDetailsModal animal={selectedAnimal} onClose={closeDetailsModal} />
        )}

        {/* Modal for adding animal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto scrollbar-rounded">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Fermer le formulaire"
              >
                <X className="h-6 w-6 text-gray-800 dark:text-dark-text" />
              </button>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-dark-text">
                Ajouter un animal
              </h3>
              <AddAnimalForm
                onAddAnimal={handleAddAnimal}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}