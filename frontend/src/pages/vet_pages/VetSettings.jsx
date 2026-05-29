import React, { useState, useEffect, useRef } from "react";
import { Save, User, Clock, Shield, Bell, Lock, Eye, EyeOff, Camera } from "lucide-react";
import VetLayout from './VetLayout';
import PageSpinner from '../../components/PageSpinner';
import api, { mediaUrl } from '../../services/api';


const VetSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    bio: "",
  });

  const [schedule, setSchedule] = useState({});

  const [notifications, setNotifications] = useState({
    newAppointment: true,
    appointmentReminder: true,
    newMessage: true,
    weeklyReport: true,
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const dayLabels = { Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi", Thursday: "Jeudi", Friday: "Vendredi", Saturday: "Samedi", Sunday: "Dimanche" };

  useEffect(() => {
    fetchProfile();
    fetchSchedule();
  }, []);

const fetchSchedule = async () => {
    try {
      const response = await api.get('/user/vets/schedule/');
      const defaultSchedule = {
        Monday: { open: true, start: "09:00", end: "17:00" },
        Tuesday: { open: true, start: "09:00", end: "17:00" },
        Wednesday: { open: true, start: "09:00", end: "17:00" },
        Thursday: { open: true, start: "09:00", end: "17:00" },
        Friday: { open: true, start: "09:00", end: "17:00" },
        Saturday: { open: false, start: "09:00", end: "12:00" },
        Sunday: { open: false, start: "09:00", end: "13:00" },
      };

      if (response.data.schedule && Object.keys(response.data.schedule).length > 0) {
        const savedSchedule = response.data.schedule;
        const formatted = { ...defaultSchedule };
        Object.entries(savedSchedule).forEach(([day, hours]) => {
          if (typeof hours === 'string') {
            const [start, end] = hours.split(' - ');
            formatted[day] = { open: hours !== 'Fermé', start: start?.trim() || '09:00', end: end?.trim() || '17:00' };
          } else {
            formatted[day] = { open: hours.open !== false, start: hours.start || '09:00', end: hours.end || '17:00' };
          }
        });
        setSchedule(formatted);
      } else {
        setSchedule(defaultSchedule);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      const defaultSchedule = {
        Monday: { open: true, start: "09:00", end: "17:00" },
        Tuesday: { open: true, start: "09:00", end: "17:00" },
        Wednesday: { open: true, start: "09:00", end: "17:00" },
        Thursday: { open: true, start: "09:00", end: "17:00" },
        Friday: { open: true, start: "09:00", end: "17:00" },
        Saturday: { open: false, start: "09:00", end: "12:00" },
        Sunday: { open: false, start: "09:00", end: "13:00" },
      };
      setSchedule(defaultSchedule);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/profile/');
      const userData = response.data;
      const profileData = userData.profile || {};
      setProfile({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        city: profileData.city || "",
        address: profileData.address || "",
        bio: profileData.bio || "",
      });
      if (profileData.avatar) {
        setAvatarPreview(mediaUrl(profileData.avatar));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await api.patch('/user/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const profileData = response.data.profile || {};
      if (profileData.avatar) {
        setAvatarPreview(mediaUrl(profileData.avatar));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e && e.preventDefault();
    try {
      await api.patch('/user/profile/', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        profile: {
          city: profile.city,
          address: profile.address,
          bio: profile.bio,
        },
      });
      await fetchProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const apiSchedule = {};
      Object.entries(schedule).forEach(([day, config]) => {
        if (config.open) {
          apiSchedule[day] = `${config.start} - ${config.end}`;
        } else {
          apiSchedule[day] = 'Fermé';
        }
      });
      await api.post('/user/vets/schedule/', { schedule: apiSchedule });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      await api.post('/auth/change-password/', {
        old_password: passwords.current,
        new_password: passwords.newPass,
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Erreur lors du changement de mot de passe");
    }
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "schedule", label: "Horaires", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
  ];

  if (loading) {
    return (
      <VetLayout>
        <div className="p-10 flex items-center justify-center min-h-[400px]">
          <PageSpinner compact />
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Paramètres</h1>
          <p className="text-gray-600">Gérez votre profil et vos préférences</p>
        </div>

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-2">
            ✅ Modifications enregistrées avec succès !
          </div>
        )}

        <div className="flex gap-6">
          <div className="w-48 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-[#8657ff] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Informations du profil</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#8657ff] text-white flex items-center justify-center text-2xl font-bold">
                          {profile.first_name?.[0] || 'V'}{profile.last_name?.[0] || ''}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 bg-[#8657ff] text-white p-1.5 rounded-full hover:bg-purple-700"
                      >
                        {uploading ? (
                          <PageSpinner compact size="3xs" borderTone="onDark" />
                        ) : (
                          <Camera className="w-3 h-3" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Dr. {profile.first_name} {profile.last_name}</p>
                      <p className="text-gray-500 text-sm">Vétérinaire</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input type="text" value={profile.first_name}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input type="text" value={profile.last_name}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input type="tel" value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input type="text" value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
                    <input type="text" value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                    <textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                  </div>

                  <div className="pt-4 border-t">
                    <button type="submit" className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium">
                      <Save className="w-4 h-4" /> Enregistrer les modifications
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Horaires d'ouverture</h2>
                <div className="space-y-4">
                  {Object.entries(schedule).map(([day, config]) => (
                    <div key={day} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                      <div className="w-28">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={config.open}
                            onChange={(e) => setSchedule({ ...schedule, [day]: { ...config, open: e.target.checked } })}
                            className="w-4 h-4 text-[#8657ff]" />
                          <span className={`font-medium text-sm ${config.open ? "text-gray-900" : "text-gray-400"}`}>{dayLabels[day]}</span>
                        </label>
                      </div>
                      {config.open ? (
                        <div className="flex items-center gap-3">
                          <input type="time" value={config.start}
                            onChange={(e) => setSchedule({ ...schedule, [day]: { ...config, start: e.target.value } })}
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                          <span className="text-gray-400">—</span>
                          <input type="time" value={config.end}
                            onChange={(e) => setSchedule({ ...schedule, [day]: { ...config, end: e.target.value } })}
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Fermé</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t mt-6">
                  <button onClick={handleSaveSchedule} className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium">
                    <Save className="w-4 h-4" /> Enregistrer les horaires
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Préférences de notifications</h2>
                <div className="space-y-4">
                  {[
                    { key: "newAppointment", label: "Nouveau rendez-vous", desc: "Recevoir une notification pour chaque nouveau RDV" },
                    { key: "appointmentReminder", label: "Rappel de rendez-vous", desc: "Rappel 1h avant chaque consultation" },
                    { key: "newMessage", label: "Nouveau message", desc: "Notification pour les messages des propriétaires" },
                    { key: "weeklyReport", label: "Rapport hebdomadaire", desc: "Résumé statistique chaque lundi" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-gray-500">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications[key]}
                          onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                          className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8657ff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t mt-6">
                  <button onClick={handleSaveNotifications} className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium">
                    <Save className="w-4 h-4" /> Enregistrer les préférences
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Sécurité du compte</h2>
                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type={showPassword ? "text" : "password"} value={passwords.current} placeholder="••••••••"
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type={showPassword ? "text" : "password"} value={passwords.newPass} placeholder="••••••••"
                        onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type={showPassword ? "text" : "password"} value={passwords.confirm} placeholder="••••••••"
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8657ff]" />
                    </div>
                  </div>
                  {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
                    <p className="text-red-500 text-sm">Les mots de passe ne correspondent pas.</p>
                  )}
                  <button type="submit" className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium">
                    <Save className="w-4 h-4" /> Changer le mot de passe
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </VetLayout>
  );
};

export default VetSettings;