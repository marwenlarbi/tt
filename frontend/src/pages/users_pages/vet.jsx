import { useState } from 'react';
import Layout from '../../components/Layout';

const vetData = [
  {
    id: '1',
    name: 'Dr. Mouna Boukadi',
    city: 'Ben Arous',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6Kqt6vs7YvZXCB-7NpouY4jDPLdClHA4NrA&s',
    specialty: 'Médecine Générale',
    rating: 4.5,
    reviews: 22,
    specialties: ['Médecine Générale'],
    schedule: {
      Monday: '09:00 AM - 05:00 PM',
      Tuesday: '09:00 AM - 05:00 PM',
      Wednesday: '09:00 AM - 05:00 PM',
      Thursday: '09:00 AM - 05:00 PM',
      Friday: '09:00 AM - 03:00 PM',
      Saturday: 'closed',
      Sunday: '09:00 AM - 03:00 PM'
    },
    reviewsData: [
      { user: 'imen slama', date: '10-11-2024', rating: 5, comment: 'Je voulais toujours poser la question si vous faites des consultations à maison ?' },
      { user: 'imen slama', date: '10-11-2024', rating: 5, comment: "Un véto très bien, j'aime son amour envers les animaux et sa patience, je peux l'y confier mes bb" }
    ],
    phone: '98356535'
  },
  {
    id: '2',
    name: 'Dr. Walid Ben Mustapha',
    city: 'Tunis',
    image: 'data:image/jpeg;base64,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',
    specialty: 'Dermatologie',
    rating: 4.2,
    reviews: 15,
    specialties: ['Cardiology', 'Internal Medicine'],
    schedule: {
      Monday: '24 h',
      Tuesday: '09:00 AM - 05:00 PM',
      Wednesday: '09:00 AM - 05:00 PM',
      Thursday: '09:00 AM - 05:00 PM',
      Friday: '09:00 AM - 03:00 PM',
      Saturday: 'closed',
      Sunday: '09:00 AM - 03:00 PM'
    },
    reviewsData: [
      { user: 'imen slama', date: '10-11-2024', rating: 5, comment: 'Je voulais toujours poser la question si vous faites des consultations à maison ?' },
      { user: 'imen slama', date: '10-11-2024', rating: 5, comment: "Un véto très bien, j'aime son amour envers les animaux et sa patience, je peux l'y confier mes bb" }
    ],
    phone: '98356535'
  },
  {
    id: '3',
    name: 'CLINIQUE VETERINAIRE SAINT GERMAIN',
    city: 'Ben Arous',
    image: 'data:image/jpeg;base64,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',
    specialty: 'Clinique',
    rating: 4.6,
    reviews: 28,
    specialties: ['Médecine Générale', 'Chirurgie'],
    schedule: {
      Monday: '09:00 AM - 05:00 PM',
      Tuesday: '09:00 AM - 05:00 PM',
      Wednesday: '09:00 AM - 05:00 PM',
      Thursday: '09:00 AM - 05:00 PM',
      Friday: '09:00 AM - 03:00 PM',
      Saturday: 'closed',
      Sunday: '09:00 AM - 03:00 PM'
    },
    reviewsData: [
      { user: 'imen slama', date: '10-11-2024', rating: 5, comment: 'Je voulais toujours poser la question si vous faites des consultations à maison ?' },
      { user: 'imen slama', date: '10-11-2024', rating: 5, comment: "Un véto très bien, j'aime son amour envers les animaux et sa patience, je peux l'y confier mes bb" }
    ],
    phone: '98356535'
  },
];

const Vet = () => {
  const [selectedVet, setSelectedVet] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);

  const openModal = (vet) => {
    setSelectedVet(vet);
  };

  const closeModal = () => {
    setSelectedVet(null);
    setShowCommentInput(false);
    setComment('');
    setRating(0);
  };

  const handleCommentClick = () => {
    setShowCommentInput(true);
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (selectedVet && comment && rating > 0) {
      const newReview = {
        user: 'Current User', // Replace with actual user data if available
        date: new Date().toLocaleDateString('fr-FR'),
        rating: rating,
        comment: comment
      };
      selectedVet.reviewsData = [...selectedVet.reviewsData, newReview];
      setComment('');
      setRating(0);
      setShowCommentInput(false);
    }
  };

  return (
    <Layout className="bg-gray-100 dark:bg-dark-gray min-h-screen">
      {/* Barre de recherche */}
      <div className="bg-white dark:bg-dark-card p-4 shadow-md">
  <div className="container mx-auto flex items-center gap-4">
    
    <div className="flex-1">
      <input
        type="text"
        placeholder="Recherche par nom ou ville"
        className="w-full bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text border border-gray-300 dark:border-dark-accent p-2 rounded"
      />
    </div>

    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
      <svg
        className="h-6 w-6 text-gray-500 dark:text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 19l-6-6M4 9a7 7 0 1114 0 7 7 0 01-14 0z"
        />
      </svg>
    </button>

  </div>
</div>


      {/* Liste des vétérinaires */}
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-dark-text mb-4">Tous les vétérinaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vetData.map((vet) => (
            <div
              key={vet.id}
              onClick={() => openModal(vet)}
              className="cursor-pointer overflow-hidden border-gray-200 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-white dark:bg-dark-card"
            >
              <div className="relative">
                <img src={vet.image} alt={vet.name} className="w-full h-40 object-cover"/>
                {/* Icône de favori */}
                <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21l-6-6m6 6l6-6M12 3l-6 6M12 3l6 6"/>
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{vet.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{vet.city}</p>
                <span className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 rounded-full py-1 px-2 text-xs">{vet.specialty}</span>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.27l-5.18 3.09 1.64-6.91-5.12-4.73h6.36L12 3.2l2.3 6.82h6.36l-5.12 4.73 1.64 6.91z"/>
                  </svg>
                  <span>{vet.rating} ({vet.reviews} avis)</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10h4v4h-4z"/>
                  </svg>
                  <span>12:00 AM - 12:00 AM</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <button className="mr-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-accent p-2 rounded">
            Précédent
          </button>
          <button className="mr-2 textS-gray-700 dark:text-gray-300 ">
            1
          </button>
          <button className="mr-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-accent p-2 rounded">
            Suivant
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedVet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto scrollbar-rounded">
            {/* Close button */}
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            {/* Vet Details */}
            <div className="flex items-center mb-4">
              <img src={selectedVet.image} alt={selectedVet.name} className="w-16 h-16 rounded-full mr-4 object-cover"/>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text">{selectedVet.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedVet.city}</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.27l-5.18 3.09 1.64-6.91-5.12-4.73h6.36L12 3.2l2.3 6.82h6.36l-5.12 4.73 1.64 6.91z"/>
                  </svg>
                  <span>{selectedVet.rating} ({selectedVet.reviews} avis)</span>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Spécialités</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {selectedVet.specialties.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>

            {/* Schedule */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Jours ouvrés</h4>
              <div className="space-y-2">
                {Object.entries(selectedVet.schedule).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{day}</span>
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10h4v4h-4z"/>
                      </svg>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Avis ({selectedVet.reviews})</h4>
                {!showCommentInput && (
                  <button onClick={handleCommentClick} className="text-primary hover:underline">
                    Ajouter un commentaire ?
                  </button>
                )}
                
              </div>
              {showCommentInput && selectedVet && (
                  <form onSubmit={handleSubmitComment} className="mt-4">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note</label>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            onClick={() => setRating(i + 1)}
                            className={`h-6 w-6 cursor-pointer ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.27l-5.18 3.09 1.64-6.91-5.12-4.73h6.36L12 3.2l2.3 6.82h6.36l-5.12 4.73 1.64 6.91z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-dark-accent rounded-md text-gray-700 dark:text-dark-text bg-white dark:bg-dark-card"
                      placeholder="Écrivez votre commentaire..."
                      rows="3"
                    />
                    <div className="mt-2 flex space-x-2">
                      <button
                        type="submit"
                        className="bg-primary text-white py-1 px-3 rounded-md hover:bg-primary-dark"
                      >
                        Soumettre
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCommentInput(false)}
                        className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-1 px-3 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              <div className="space-y-4 mt-2">
                {selectedVet.reviewsData.map((review, index) => (
                  <div key={index} className="border-t border-gray-200 dark:border-dark-accent pt-2">
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-dark-text">{review.user}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17.27l-5.18 3.09 1.64-6.91-5.12-4.73h6.36L12 3.2l2.3 6.82h6.36l-5.12 4.73 1.64 6.91z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                  </div>
                ))}
                
              </div>
            </div>

            {/* Contact Button */}
            <div className="flex justify-center">
              <a href={`tel:${selectedVet.phone}`} className="flex items-center bg-purple-500 text-white py-2 px-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m-5 7h12M9 11v2m-5 7h12M9 19v2"/>
                </svg>
                {selectedVet.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Vet;