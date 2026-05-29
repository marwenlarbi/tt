import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, MessageCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import { CHEEBO_OPEN_PRIVATE_CHAT_EVENT } from '../../components/Chat/PrivateChat';
import api from '../../services/api';

const Following = () => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
      fetchFollowing(userData.id);
    }
  }, []);

  const fetchFollowing = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/user/following/${userId}/`);
      setFollowing(response.data);
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFollowing = following.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnfollow = async (userId) => {
    try {
      await api.post('/user/follow/', { user_id: userId });
      setFollowing((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error unfollowing:", error);
    }
  };

  const openPrivateChat = (user) => {
    window.dispatchEvent(
      new CustomEvent(CHEEBO_OPEN_PRIVATE_CHAT_EVENT, {
        detail: { user: { id: user.id, name: user.name, avatar: user.avatar } },
      })
    );
  };

  return (
    <Layout className="bg-gray-100 min-h-screen">
      <div className="bg-white p-4 shadow-md">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Abonnements</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans vos abonnements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {loading ? (
          <PageSpinner />
        ) : filteredFollowing.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Vous ne suivez personne pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFollowing.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleUnfollow(user.id)}
                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Se désabonner
                  </button>
                  <button
                    type="button"
                    onClick={() => openPrivateChat(user)}
                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Following;