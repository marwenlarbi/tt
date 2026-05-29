import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, MessageCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import api from '../../services/api';

const Followers = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
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
    <Layout>
      <div className="border-b border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-dark-card">
        <div className="container mx-auto">
          <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-dark-text">Followers</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher dans vos followers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text dark:placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {loading ? (
          <PageSpinner />
        ) : filteredFollowers.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore de followers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
             {filteredFollowers.map((user) => (
               <div
                 key={user.id}
                 className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-dark-accent"
               >
                 <div
                   className="flex cursor-pointer items-center gap-4"
                   onClick={() => navigate(`/users/${user.id}`)}
                   role="presentation"
                 >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-dark-text">{user.name}</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-white transition-colors hover:bg-primary-dark"
                  >
                    <MessageCircle className="h-4 w-4" />
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