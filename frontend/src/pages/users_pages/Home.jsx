import React, { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Heart, MessageSquare, Share2, PenLine, X, Users, Bookmark,  Video, Store, MoreHorizontal, Search, PawPrint, Send, Play, Pause, Upload, Image as ImageIcon } from 'lucide-react';

// Profils d'utilisateurs détaillés
const userProfiles = {
  1: {
    id: 1,
    name: 'ali khalil',
    image: '/users/user_1.jpg',
    bio: 'Passionné d\'animaux, propriétaire de Rex depuis 5 ans. J\'adore partager nos aventures !',
    location: 'Paris, France',
    pets: [
      { name: 'Rex', type: 'Chien', breed: 'Golden Retriever', age: 5 }
    ],
    followers: 245,
    following: 180,
    posts: 42,
    joinDate: 'Mars 2019'
  },
  2: {
    id: 2,
    name: 'Marie Lefèvre',
    image: '/users/user_2.jpg',
    bio: 'Vétérinaire de profession et amoureuse des chats. Maman de Milo 🐱',
    location: 'Lyon, France',
    pets: [
      { name: 'Milo', type: 'Chat', breed: 'Européen', age: 2 }
    ],
    followers: 892,
    following: 234,
    posts: 78,
    joinDate: 'Janvier 2018'
  },
  3: {
    id: 3,
    name: 'Thomas Martin',
    image: '/users/user_3.avif',
    bio: 'Photographe animalier amateur. Luna est mon modèle préféré !',
    location: 'Marseille, France',
    pets: [
      { name: 'Luna', type: 'Chat', breed: 'Maine Coon', age: 3 }
    ],
    followers: 156,
    following: 89,
    posts: 23,
    joinDate: 'Septembre 2020'
  }
};

// Composant pour les éléments de la barre latérale
const SidebarItem = ({ icon, text, onClick }) => {
  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium text-gray-900 dark:text-dark-text">{text}</span>
    </div>
  );
};

// Composant pour les utilisateurs connectés
const ConnectedUserItem = ({ userImage, name, isOnline, onClick }) => {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" onClick={onClick}>
      <img
        src={userImage}
        alt={`${name} profile`}
        className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-600"
      />
      <span className="text-sm font-medium text-gray-900 dark:text-dark-text">{name}</span>
      <div className={`w-3 h-3 rounded-full ml-auto ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
    </div>
  );
};

// Modal de profil utilisateur
const UserProfileModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header du profil */}
        <div className="text-center mb-6">
          <img
            src={user.image}
            alt={user.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary"
          />
          <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">{user.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{user.location}</p>
          <p className="text-gray-700 dark:text-gray-300 mt-2">{user.bio}</p>
        </div>

        {/* Statistiques */}
        <div className="flex justify-around bg-gray-50 dark:bg-dark-accent rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="font-bold text-lg text-primary">{user.posts}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-primary">{user.followers}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Abonnés</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-primary">{user.following}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Suivi</div>
          </div>
        </div>

        {/* Animaux */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-dark-text mb-3">Ses animaux</h3>
          {user.pets.map((pet, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-accent rounded-lg mb-2">
              <PawPrint className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium text-gray-800 dark:text-dark-text">{pet.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{pet.breed} • {pet.age} ans</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg font-medium">
            Suivre
          </button>
          <button className="flex-1 bg-gray-200 dark:bg-dark-accent hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-dark-text py-2 px-4 rounded-lg font-medium">
            Message
          </button>
        </div>

        <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
          Membre depuis {user.joinDate}
        </div>
      </div>
    </div>
  );
};

// Barre latérale gauche
const LeftSidebar = ({ onShowUserProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="w-64 bg-gray-50 dark:bg-dark-card border-r border-gray-200 dark:border-gray-600 p-4 overflow-y-auto h-screen hidden lg:block scrollbar-thin scrollbar-thumb-custom-purple scrollbar-track-custom-light-track dark:scrollbar-track-custom-dark-track scrollbar-rounded">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-dark-text" />
          <input
            type="text"
            placeholder="Rechercher"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark"
          />
        </div>
      </div>
      <div className="mb-4">
        <SidebarItem icon={<Users className="w-6 h-6 text-primary" />} text="Utilisateur" onClick={() => handleNavigation('/profile')} />
        <SidebarItem icon={<Users className="w-6 h-6 text-primary" />} text="Amis" />
        <SidebarItem icon={<Bookmark className="w-6 h-6 text-primary" />} text="Enregistrements" />
        <SidebarItem icon={<Users className="w-6 h-6 text-primary" />} text="Groupes" />
        <SidebarItem icon={<Video className="w-6 h-6 text-primary" />} text="Vidéos" />
        <SidebarItem icon={<Store className="w-6 h-6 text-primary" />} text="Marketplace" />
        <SidebarItem icon={<PawPrint className="w-6 h-6 text-primary" />} text="Adoption" onClick={() => handleNavigation('/adoption')}/>
      </div>
    </div>
  );
};

// Barre latérale droite
const RightSidebar = ({ onShowUserProfile }) => {
  const connectedUsers = [
    { id: 1, userImage: '/users/user_1.jpg', name: 'ali khalil', isOnline: true },
    { id: 2, userImage: '/users/user_2.jpg', name: 'Marie Lefèvre', isOnline: false },
    { id: 3, userImage: '/users/user_3.avif', name: 'Thomas Martin', isOnline: true },
    { userImage: '/users/user_4.jpg', name: 'Alice Dubois', isOnline: true },
    { userImage: '/users/user_5.jpg', name: 'Bob Martin', isOnline: false },
  ];

  return (
    <div className="w-64 bg-gray-50 dark:bg-dark-card border-l border-gray-200 dark:border-gray-600 p-4 overflow-y-auto h-screen hidden lg:block scrollbar-thin scrollbar-thumb-custom-purple scrollbar-track-custom-light-track dark:scrollbar-track-custom-dark-track scrollbar-rounded">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-text">Utilisateurs connectés</h2>
        {connectedUsers.map((user, index) => (
          <ConnectedUserItem
            key={index}
            userImage={user.userImage}
            name={user.name}
            isOnline={user.isOnline}
            onClick={() => user.id && onShowUserProfile(user.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Composant vidéo
const VideoPlayer = ({ src, poster }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto rounded-lg"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
      >
        {isPlaying ? (
          <Pause className="w-12 h-12 text-white" />
        ) : (
          <Play className="w-12 h-12 text-white" />
        )}
      </button>
    </div>
  );
};

// Composant pour un commentaire individuel
const Comment = ({ comment, onShowUserProfile }) => {
  return (
    <div className="flex items-start gap-3 p-3 border-t border-gray-200 dark:border-gray-600">
      <img
        src={comment.userImage}
        alt={`${comment.user} profile`}
        className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary"
        onClick={() => comment.userId && onShowUserProfile(comment.userId)}
      />
      <div>
        <p 
          className="font-semibold text-sm text-gray-800 dark:text-dark-text cursor-pointer hover:text-primary"
          onClick={() => comment.userId && onShowUserProfile(comment.userId)}
        >
          {comment.user}
        </p>
        <p className="text-sm text-gray-600 dark:text-dark-text">{comment.text}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{comment.time}</p>
      </div>
    </div>
  );
};

// Composant principal pour une carte de post
const PostCard = ({ post, onComment, onShare, onShowUserProfile }) => {
  const [liked, setLiked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, {
        userImage: '/users/current_user.jpg',
        user: 'Utilisateur Actuel',
        text: commentText,
        time: 'À l\'instant',
      });
      setCommentText('');
    }
  };

  const handleShare = () => {
    onShare(post.id);
  };

  return (
    <div className="w-full bg-white dark:bg-dark-card shadow-md rounded-lg mb-6 overflow-hidden transition-colors duration-300 relative">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <img
            src={post.userImage}
            alt={`${post.user} profile`}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary"
            onClick={() => onShowUserProfile(post.userId)}
          />
          <div>
            <p 
              className="font-semibold text-gray-800 dark:text-dark-text cursor-pointer hover:text-primary"
              onClick={() => onShowUserProfile(post.userId)}
            >
              {post.user}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-text">{post.time}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-500 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
            aria-label="Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showOptions && (
            <div
              ref={dropdownRef}
              className="absolute top-8 right-0 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg w-48 z-10"
            >
              <div className="py-1">
                <button className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                  Enregistrer l'article
                </button>
                <button className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                  Message
                </button>
                <button className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                  Rapport
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-700 dark:text-dark-text mb-4">{post.phrase}</p>
        
        {/* Affichage conditionnel pour image ou vidéo */}
        {post.type === 'video' ? (
          <VideoPlayer src={post.videoUrl} poster={post.petImage} />
        ) : (
          <img
            src={post.petImage}
            alt={`${post.user}'s pet`}
            className="w-full h-auto object-cover rounded-lg"
          />
        )}
      </div>

      <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setLiked(!liked)}
            className="flex items-center gap-2"
            aria-label={liked ? "Je n'aime plus" : "J'aime"}
          >
            <Heart className={`w-5 h-5 ${liked ? 'text-red-500 fill-red-500' : 'text-gray-500 dark:text-dark-text'}`} />
            <span className="text-sm text-gray-600 dark:text-dark-text">{liked ? post.likes + 1 : post.likes}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
            aria-label="Commenter"
          >
            <MessageSquare className="w-5 h-5 text-gray-500 dark:text-dark-text" />
            <span className="text-sm text-gray-600 dark:text-dark-text">{post.comments.length}</span>
          </button>
        </div>
        <button
          onClick={handleShare}
          className="text-gray-500 dark:text-dark-text"
          aria-label="Partager"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {showComments && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-600">
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text"
            />
            <button
              type="submit"
              className="p-2 bg-primary hover:bg-primary-dark text-white rounded-full"
              aria-label="Envoyer le commentaire"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          {post.comments.map((comment, index) => (
            <Comment key={index} comment={comment} onShowUserProfile={onShowUserProfile} />
          ))}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      userId: 1,
      userImage: '/users/user_1.jpg',
      user: 'ali khalil',
      time: 'Il y a 10 minutes',
      phrase: 'Belle journée au parc avec Rex ! Il adore courir après les écureuils.',
      petImage: '/pets/pet_1.webp',
      type: 'image',
      likes: 42,
      comments: [],
    },
    {
      id: 2,
      userId: 2,
      userImage: '/users/user_2.jpg',
      user: 'Marie Lefèvre',
      time: 'Il y a 1 heure',
      phrase: 'Première visite chez le vétérinaire pour Milo aujourd\'hui. Tout va bien !',
      petImage: '/pets/pet_2.jpeg',
      type: 'image',
      likes: 28,
      comments: [],
    },
    {
      id: 3,
      userId: 3,
      userImage: '/users/user_3.avif',
      user: 'Thomas Martin',
      time: 'Hier à 18:30',
      phrase: 'Nouvel arrivant dans la famille ! Voici Luna, notre petite chatte de 3 mois.',
      petImage: '/pets/pet_3.jpg',
      type: 'image',
      likes: 56,
      comments: [],
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(null);
  const [newPost, setNewPost] = useState({
    phrase: '',
    petImage: '',
    type: 'image',
    videoUrl: ''
  });

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));
  };

  const handleShare = (postId) => {
    alert(`Publication ${postId} partagée !`);
  };

  const handleShowUserProfile = (userId) => {
    const user = userProfiles[userId];
    if (user) {
      setShowUserProfile(user);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPostWithInfo = {
      ...newPost,
      id: posts.length + 1,
      userId: null, // Utilisateur actuel
      userImage: '/users/current_user.jpg', // Image par défaut
      user: 'Utilisateur Actuel', // Nom par défaut
      time: "À l'instant",
      likes: 0,
      comments: [],
    };
    setPosts([newPostWithInfo, ...posts]);
    setNewPost({ 
      phrase: '', 
      petImage: '',
      type: 'image',
      videoUrl: ''
    });
    setShowModal(false);
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'image') {
        setNewPost({ ...newPost, petImage: url, type: 'image' });
      } else if (type === 'video') {
        setNewPost({ ...newPost, videoUrl: url, petImage: url, type: 'video' });
      }
    }
  };

  return (
    <Layout>
      <div className="bg-white dark:bg-dark-gray min-h-screen flex">
        <LeftSidebar onShowUserProfile={handleShowUserProfile} />
        <div className="flex-1 container mx-auto px-4 py-6 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-custom-purple scrollbar-track-custom-light-track dark:scrollbar-track-custom-dark-track scrollbar-rounded">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition-colors duration-300"
            >
              <PenLine className="w-4 h-4" />
              <span className="font-medium">Nouvelle publication</span>
            </button>
          </div>
          <div className="max-w-2xl mx-auto">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onComment={handleComment}
                onShare={handleShare}
                onShowUserProfile={handleShowUserProfile}
              />
            ))}
          </div>
        </div>
        <RightSidebar onShowUserProfile={handleShowUserProfile} />
        
        {/* Modal de nouvelle publication */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-accent p-6 rounded-lg shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 dark:text-dark-text hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-dark-text">
                Nouvelle publication
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  placeholder="Que voulez-vous partager ?"
                  value={newPost.phrase}
                  onChange={(e) => setNewPost({ ...newPost, phrase: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-accent text-gray-800 dark:text-dark-text h-20 resize-none"
                  required
                />
                
                {/* Type de contenu */}
                <div className="flex gap-2 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentType"
                      value="image"
                      checked={newPost.type === 'image'}
                      onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                    />
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentType"
                      value="video"
                      checked={newPost.type === 'video'}
                      onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                    />
                    <Video className="w-4 h-4" />
                    Vidéo
                  </label>
                </div>

                {/* Upload de fichier */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <input
                    type="file"
                    accept={newPost.type === 'video' ? 'video/*' : 'image/*'}
                    onChange={(e) => handleFileUpload(e, newPost.type)}
                    className="hidden"
                    id="fileUpload"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Cliquez pour uploader {newPost.type === 'video' ? 'une vidéo' : 'une image'}
                    </span>
                  </label>
                  
                  {/* Prévisualisation */}
                  {newPost.type === 'image' && newPost.petImage && (
                    <img src={newPost.petImage} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
                  )}
                  {newPost.type === 'video' && newPost.videoUrl && (
                    <video src={newPost.videoUrl} className="mt-2 w-full h-32 object-cover rounded" controls />
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition-colors duration-300"
                >
                  Publier
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal de profil utilisateur */}
        {showUserProfile && (
          <UserProfileModal 
            user={showUserProfile} 
            onClose={() => setShowUserProfile(null)} 
          />
        )}
      </div>
    </Layout>
  );
};

export default Home;