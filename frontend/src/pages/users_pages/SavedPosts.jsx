import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Bookmark, MessageSquare, Heart, Share, Trash2, Loader2 } from 'lucide-react';
import api, { mediaUrl } from '../../services/api';

const getAccessToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('access') ||
  localStorage.getItem('token');

function mapPost(p) {
  const img = p.image ? mediaUrl(p.image) : '';
  const vid = p.video ? mediaUrl(p.video) : '';
  const t = (p.type || 'text').toLowerCase();
  const isVideo = t === 'video' && !!vid;
  return {
    id: p.id,
    content: p.content || '',
    image: !isVideo && img ? img : isVideo && img ? img : null,
    video: isVideo ? vid : null,
    likes: typeof p.like_count === 'number' ? p.like_count : 0,
    comments: typeof p.comment_count === 'number' ? p.comment_count : 0,
    shares: 0,
    createdAt: p.created_at,
    type: isVideo ? 'video' : t === 'image' && img ? 'image' : 'text',
    userId: p.author?.id || p.user_id || p.userId || null,
    user: p.author?.first_name && p.author?.last_name 
      ? `${p.author.first_name} ${p.author.last_name}`
      : p.author?.username || p.author || 'Utilisateur',
  };
}

const SavedPosts = () => {
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSavedPosts = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/posts/bookmarked/');
      const list = Array.isArray(data) ? data : data?.results || [];
      setSavedPosts(list.map(mapPost));
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      setError('Impossible de charger les publications enregistrées.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadSavedPosts();
  }, [loadSavedPosts]);

  const removeBookmark = async (postId) => {
    try {
      await api.delete(`/posts/bookmarks/${postId}/`);
      setSavedPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
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
      case 'video':
        return '🎬';
      default:
        return '📝';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-dark-gray min-h-screen">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-6">
            Publications enregistrées
          </h1>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement…</span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadSavedPosts}
                className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && savedPosts.length === 0 && (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucune publication enregistrée pour le moment
              </p>
            </div>
          )}

          {!loading && !error && savedPosts.length > 0 && (
            <div className="space-y-4">
              {savedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-dark-card rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
                >
                  {/* Post header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/users/${post.userId}`)}
                        className="font-semibold text-gray-800 dark:text-dark-text hover:text-primary transition-colors"
                      >
                        {post.user}
                      </button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">·</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {getPostTypeIcon(post.type)}
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeBookmark(post.id)}
                      className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                      title="Supprimer des enregistrements"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post content */}
                  {post.content && (
                    <p className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">
                      {post.content}
                    </p>
                  )}

                  {/* Post media */}
                  {post.video && (
                    <div className="mb-3 rounded-lg overflow-hidden bg-black">
                      <video
                        src={post.video}
                        controls
                        className="w-full max-h-96 object-contain"
                        playsInline
                      />
                    </div>
                  )}
                  {!post.video && post.image && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt=""
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                  )}

                  {/* Post actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
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
                      <Bookmark className="w-4 h-4 fill-current text-purple-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SavedPosts;
