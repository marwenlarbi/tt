import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, UserPlus } from 'lucide-react';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import { CHEEBO_OPEN_PRIVATE_CHAT_EVENT } from '../../components/Chat/PrivateChat';
import api from '../../services/api';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors ${
      active
        ? 'bg-purple-100 text-purple-900 dark:bg-gray-800 dark:text-white'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
    }`}
  >
    <Icon className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
    <span className="truncate">{label}</span>
  </button>
);

const Friends = () => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('followers'); // 'followers' or 'following'
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) fetchLists(user.id);
  }, []);

  const fetchLists = async (userId) => {
    setLoading(true);
    try {
      const [fRes, foRes] = await Promise.all([
        api.get(`/user/followers/${userId}/`),
        api.get(`/user/following/${userId}/`),
      ]);
      setFollowers(fRes.data || []);
      setFollowing(foRes.data || []);
    } catch (err) {
      console.error('Error fetching friends lists', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFollowers = followers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
  const filteredFollowing = following; // no search for following

  const handleUnfollow = async (userId) => {
    try {
      await api.post('/user/follow/', { user_id: userId });
      setFollowing((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Error unfollowing', err);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-20 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-dark-card">
            <nav className="flex flex-col gap-1">
              <SidebarItem icon={Users} label={`Abonnements`} active={activeTab === 'following'} onClick={() => setActiveTab('following')} />
              <SidebarItem icon={UserPlus} label={`abonnés`} active={activeTab === 'followers'} onClick={() => setActiveTab('followers')} />
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="col-span-12 lg:col-span-9">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-dark-card">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">
                {activeTab === 'followers' ? 'Followers' : 'Abonnements'}
              </h2>
              {activeTab === 'followers' && (
                <div className="w-full sm:w-72">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder={'Rechercher dans vos followers...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-dark-accent dark:text-dark-text dark:placeholder:text-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <PageSpinner />
            ) : (
              <div>
                { (activeTab === 'followers' ? filteredFollowers : filteredFollowing).length === 0 ? (
                  <div className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune personne trouvée</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(activeTab === 'followers' ? filteredFollowers : filteredFollowing).map((u) => (
                      <div
                        key={u.id}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-600 dark:bg-dark-accent"
                      >
                        <div
                          className="flex cursor-pointer items-center gap-4"
                          onClick={() => navigate(`/users/${u.id}`)}
                          role="presentation"
                        >
                          <img src={u.avatar} alt={u.name} className="h-16 w-16 rounded-full object-cover" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-dark-text">{u.name}</h3>
                          </div>
                        </div>
                        {activeTab === 'following' && (
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUnfollow(u.id)}
                              className="flex-1 rounded-lg bg-red-100 py-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              Se désabonner
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                window.dispatchEvent(
                                  new CustomEvent(CHEEBO_OPEN_PRIVATE_CHAT_EVENT, {
                                    detail: { user: { id: u.id, name: u.name, avatar: u.avatar } },
                                  })
                                )
                              }
                              className="flex-1 rounded-lg bg-primary py-2 text-white transition-colors hover:bg-primary-dark"
                            >
                              Message
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Friends;
