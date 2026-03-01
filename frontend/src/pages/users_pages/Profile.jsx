import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { MapPin, LogOut, UserCog, Upload, X, Trash2, User, PawPrint, MessageSquare, Heart, Award, Bell, Eye, Edit3, Camera, Calendar, MoreHorizontal, Share, BookmarkPlus } from 'lucide-react';

const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [profileData, setProfileData] = useState({
    name: 'Utilisateur',
    email: '',
    phone: '',
    address: '',
    city: 'Tunis',
    postalCode: '',
    country: 'Tunisia',
    bio: '',
    joinDate: new Date().toISOString(),
  });
  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: true,
  });
  const userAnimals = [];
  const stats = {
    posts: 5,
    followers: 0,
    following: 0,
    animals: 0,
    likes: 23,
  };

  const userPosts = [
    {
      id: 1,
      content: "Mon chien Max a appris un nouveau tour aujourd'hui ! Il sait maintenant faire le mort. Tellement fier de lui ! 🐕",
      image: null,
      likes: 12,
      comments: 3,
      shares: 1,
      createdAt: '2025-06-01T10:30:00Z',
      type: 'text',
    },
    {
      id: 2,
      content: "Promenade matinale avec Luna au parc. Elle adore courir après les oiseaux ! 🌳",
      image: '/api/placeholder/400/300',
      likes: 8,
      comments: 2,
      shares: 0,
      createdAt: '2025-05-30T08:15:00Z',
      type: 'image',
    },
    {
      id: 3,
      content: "Quelqu'un a-t-il des conseils pour aider un chat anxieux ? Mon chat Minou semble stressé ces derniers temps.",
      image: null,
      likes: 5,
      comments: 7,
      shares: 2,
      createdAt: '2025-05-28T16:45:00Z',
      type: 'question',
    },
    {
      id: 4,
      content: "Séance de toilettage pour Bella aujourd'hui. Elle brille comme une star ! ✨",
      image: '/api/placeholder/400/300',
      likes: 15,
      comments: 4,
      shares: 1,
      createdAt: '2025-05-25T14:20:00Z',
      type: 'image',
    },
    {
      id: 5,
      content: "Petit rappel : n'oubliez pas de vermifuger vos animaux régulièrement ! C'est important pour leur santé. 💊",
      image: null,
      likes: 9,
      comments: 1,
      shares: 3,
      createdAt: '2025-05-22T11:00:00Z',
      type: 'advice',
    },
  ];

  const navigate = useNavigate();

  const tabs = [
    { id: 'info', label: 'Mes Posts', icon: MessageSquare },
    { id: 'animals', label: 'Animaux', icon: PawPrint },
    { id: 'activity', label: 'Activité', icon: MessageSquare },
    { id: 'settings', label: 'Paramètres', icon: UserCog },
  ];

  useEffect(() => {
    return () => {
      if (profileImage) URL.revokeObjectURL(profileImage);
    };
  }, [profileImage]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleEditProfile = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setProfileImage(null);
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (selectedImage) setProfileImage(URL.createObjectURL(selectedImage));
    closeModal();
    console.log('Profil sauvegardé:', profileData);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'advice':
        return '💡';
      case 'image':
        return '📸';
      default:
        return '📝';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 bg-gray-50 dark:bg-dark-gray text-gray-900 dark:text-dark-text min-h-screen relative transition-colors duration-300">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shadow-lg">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              <button
                onClick={handleEditProfile}
                className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-2">
                {profileData.name}
              </h2>
              <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {profileData.city}, {profileData.country}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start text-gray-600 dark:text-gray-400 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Membre depuis {new Date(profileData.joinDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{profileData.bio}</p>

              <div className="flex justify-center md:justify-start space-x-4 mb-4">
                <div className="text-center">
                  <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.followers}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Abonnés</p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.following}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Abonnements</p>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-800 dark:text-dark-text">{stats.animals}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Animaux</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors text-sm border-b-2 ${
                    activeTab === tab.id
                      ? 'text-primary border-primary bg-purple-50 dark:bg-gray-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Mes publications</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{userPosts.length} posts</span>
                  <button
                    onClick={() => navigate('/home')}
                    className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Nouveau post</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Aucune publication pour le moment</p>
                    <button
                      onClick={() => navigate('/home')}
                      className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                    >
                      Créer votre premier post
                    </button>
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <div key={post.id} className="bg-gray-50 dark:bg-dark-accent rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt="Profil"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-dark-text text-sm">{profileData.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                              <span>{formatTimeAgo(post.createdAt)}</span>
                              <span>{getPostTypeIcon(post.type)}</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <p className="text-gray-800 dark:text-dark-text text-sm leading-relaxed">{post.content}</p>
                        {post.image && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-xs">{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs">{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                            <Share className="w-4 h-4" />
                            <span className="text-xs">{post.shares}</span>
                          </button>
                        </div>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-purple-500 transition-colors">
                          <BookmarkPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'animals' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Mes Animaux</h3>
                <button
                  onClick={() => navigate('/pets')}
                  className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  Ajouter un animal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAnimals.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Aucun animal enregistré</p>
                    <button
                      onClick={() => navigate('/pets')}
                      className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                    >
                      Ajouter votre premier animal
                    </button>
                  </div>
                ) : (
                  userAnimals.map((animal) => (
                    <div key={animal.id} className="bg-gray-50 dark:bg-dark-accent rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                          <PawPrint className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-dark-text text-sm">{animal.name}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{animal.type} • {animal.breed}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{animal.age}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Activité récente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                  <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-600">{stats.posts}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Posts publiés</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                  <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-red-600">{stats.likes}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">J'aime reçus</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                  <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-600">3</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Badges obtenus</div>
                </div>
              </div>
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">Commencez à publier pour voir votre activité ici</p>
                <button
                  onClick={() => navigate('/home')}
                  className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                >
                  Créer un post
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">Paramètres du compte</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-accent rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-dark-text text-sm">Notifications</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Recevoir des notifications</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-accent rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-dark-text text-sm">Profil public</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Rendre mon profil visible</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.publicProfile}
                      onChange={(e) => handleSettingChange('publicProfile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-base font-semibold text-gray-800 dark:text-dark-text mb-3">Zone de danger</h4>
                <button
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                      alert('Fonctionnalité de suppression de compte (simulation)');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto scrollbar scrollbar-thumb-custom-purple scrollbar-track-custom-light-track dark:scrollbar-track-custom-dark-track scrollbar-rounded border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                    Modifier le profil
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    {selectedImage ? (
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg"
                      />
                    ) : profileImage ? (
                      <img
                        src={profileImage}
                        alt="Current"
                        className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary-dark transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Changer la photo</p>
                    </div>
                  </label>

                  <input
                    type="text"
                    placeholder="Nom"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Adresse"
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Ville"
                    value={profileData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Code Postal"
                    value={profileData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  />
                  <select
                    value={profileData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-accent text-gray-900 dark:text-dark-text text-sm"
                  >
                    <option value="Algeria">Algeria</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Morocco">Morocco</option>
                  </select>

                  <div className="flex space-x-2">
                    <button
                      className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded transition-colors text-sm"
                      onClick={handleSaveProfile}
                    >
                      Enregistrer les modifications
                    </button>
                    {(selectedImage || profileImage) && (
                      <button
                        onClick={handleRemoveImage}
                        className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;