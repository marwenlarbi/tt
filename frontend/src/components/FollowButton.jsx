import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import PageSpinner from './PageSpinner';
import api from '../services/api';

const FollowButton = ({
  userId,
  initialFollowing = false,
  initialFollowersCount = 0,
  onFollowChange,
  skipInitialStatusFetch = false,
  showFollowersCount = true,
  canFollow = true,
  compact = false,
  textOnly = false,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsFollowing(initialFollowing);
    setFollowersCount(initialFollowersCount);
  }, [userId, initialFollowing, initialFollowersCount]);

  useEffect(() => {
    if (!userId || skipInitialStatusFetch) return undefined;
    (async () => {
      try {
        const response = await api.get(`/user/is-following/${userId}/`);
        setIsFollowing(response.data.is_following);
        setFollowersCount(response.data.followers_count);
      } catch (err) {
        console.error('Error checking follow status:', err);
      }
    })();
    return undefined;
  }, [userId, skipInitialStatusFetch]);

  const handleFollow = async () => {
    if (!canFollow) {
      setError('Action impossible (blocage)');
      return;
    }
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Veuillez vous connecter pour suivre');
      return;
    }

    const wasFollowing = isFollowing;
    const wasCount = followersCount;
    const optimisticFollowing = !wasFollowing;
    setIsFollowing(optimisticFollowing);
    setFollowersCount((c) => Math.max(0, c + (optimisticFollowing ? 1 : -1)));
    if (onFollowChange) onFollowChange(optimisticFollowing);

    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/user/follow/', { user_id: userId });
      const serverFollowing = !!data.following;
      setIsFollowing(serverFollowing);
      if (serverFollowing !== optimisticFollowing) {
        setFollowersCount(wasCount);
      }
      if (onFollowChange) onFollowChange(serverFollowing);
    } catch (err) {
      setIsFollowing(wasFollowing);
      setFollowersCount(wasCount);
      if (onFollowChange) onFollowChange(wasFollowing);
      console.error('Error following/unfollowing:', err);
      setError(err.response?.data?.error || 'Erreur lors de l’action');
    } finally {
      setLoading(false);
    }
  };

  const btnClass = textOnly
    ? `flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80`
    : compact
    ? `flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full font-medium transition-colors text-white border ${
        isFollowing
          ? 'border-primary-dark'
          : ''
      }`
    : `flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors text-white border ${
        isFollowing
          ? 'border-primary-dark'
          : ''
      }`;

  const btnStyle = textOnly
    ? { color: '#8657ff' }
    : { backgroundColor: '#8657ff' };

  if (!canFollow) {
    return null;
  }

  if (loading) {
    return (
      <button type="button" disabled style={btnStyle} className={`${btnClass} cursor-wait opacity-80`}>
        <PageSpinner compact size="xs" borderTone="onDark" className="shrink-0" />
        <span className="hidden sm:inline">…</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={() => void handleFollow()} disabled={loading} style={btnStyle} className={btnClass}>
        {isFollowing ? (
          <>
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Suivi</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Suivre</span>
          </>
        )}
      </button>
      {showFollowersCount && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{followersCount} abonné(s)</span>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default FollowButton;
