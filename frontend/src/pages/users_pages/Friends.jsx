import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, User, PawPrint, Stethoscope, Users, UserPlus, UserCheck, Bookmark, Store } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-md ${active ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
    <Icon className="w-5 h-5 text-purple-400" />
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

  const handleConfirm = async (userId) => {
    // current user follows this user (make it mutual)
    try {
      const res = await api.post('/user/follow/', { user_id: userId });
      if (res.data.following) {
        const user = followers.find((u) => u.id === userId);
        setFollowing((prev) => [user, ...prev]);
        setFollowers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error('Error confirming follower', err);
    }
  };

  const handleRemoveFollower = async (userId) => {
    // optimistic UI removal; attempt backend call if endpoint exists
    setFollowers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await api.post('/user/remove-follower/', { user_id: userId });
    } catch (err) {
      // endpoint may not exist yet; ignore silently
      console.warn('Remove follower endpoint not available', err?.response?.status);
    }
  };

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
          <div className="bg-gray-900 rounded-lg p-4 sticky top-20">
            <nav className="flex flex-col gap-1">
              <SidebarItem icon={Users} label={`Abonnements`} active={activeTab === 'following'} onClick={() => setActiveTab('following')} />
              <SidebarItem icon={UserPlus} label={`abonnés`} active={activeTab === 'followers'} onClick={() => setActiveTab('followers')} />
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{activeTab === 'followers' ? 'Followers' : 'Abonnements'}</h2>
              {activeTab === 'followers' && (
                <div className="w-72">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={'Rechercher dans vos followers...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8657ff]"></div>
              </div>
            ) : (
              <div>
                { (activeTab === 'followers' ? filteredFollowers : filteredFollowing).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune personne trouvée</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === 'followers' ? filteredFollowers : filteredFollowing).map((u) => (
                      <div key={u.id} className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/users/${u.id}`)}>
                          <img src={u.avatar} alt={u.name} className="w-16 h-16 rounded-full object-cover" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{u.name}</h3>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {activeTab === 'followers' ? (
                            <>
                              <button onClick={() => handleConfirm(u.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">Confirmer</button>
                              <button onClick={() => handleRemoveFollower(u.id)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors">Supprimer</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleUnfollow(u.id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors">Se désabonner</button>
                              <button onClick={() => navigate(`/chat/${u.id}`)} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors">Message</button>
                            </>
                          )}
                        </div>
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
