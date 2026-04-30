import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, MessageCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Followers = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(userData);
    if (userData.id) {
      fetchFollowers(userData.id);
    }
  }, []);

  const fetchFollowers = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/user/followers/${userId}/`);
      setFollowers(response.data);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFollowers = followers.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout className="bg-gray-100 min-h-screen">
      <div className="bg-white p-4 shadow-md">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Followers</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans vos followers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8657ff]"></div>
          </div>
        ) : filteredFollowers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Vous n'avez pas encore de followers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredFollowers.map((user) => (
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
                <div className="mt-4">
                  <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Envoyer un message
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

export default Followers;