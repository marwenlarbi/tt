import React, { useState } from "react";
import { Save, User, Clock, Shield, Bell, Lock } from "lucide-react";
import VetLayout from '../vet_pages/VetLayout';
const VetSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Dr. Mouna Boukadi",
    email: "dr.mouna@vetclinic.com",
    phone: "+216 98 356 535",
    city: "Ben Arous",
    address: "123 Avenue Habib Bourguiba, Ben Arous",
    specialty: "Médecine Générale",
    licenseNumber: "VET-TN-2020-001",
    experience: "8",
    education: "École Nationale de Médecine Vétérinaire de Sidi Thabet",
    bio: "Vétérinaire passionnée avec 8 ans d'expérience en médecine générale et chirurgie animale.",
    languages: "Français, Arabe, Anglais",
  });

  const [schedule, setSchedule] = useState({
    Monday: { open: true, start: "09:00", end: "17:00" },
    Tuesday: { open: true, start: "09:00", end: "17:00" },
    Wednesday: { open: true, start: "09:00", end: "17:00" },
    Thursday: { open: true, start: "09:00", end: "17:00" },
    Friday: { open: true, start: "09:00", end: "15:00" },
    Saturday: { open: false, start: "09:00", end: "12:00" },
    Sunday: { open: true, start: "09:00", end: "13:00" },
  });

  const [notifications, setNotifications] = useState({
    newAppointment: true,
    appointmentReminder: true,
    newMessage: true,
    newReview: false,
    weeklyReport: true,
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const dayLabels = { Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi", Thursday: "Jeudi", Friday: "Vendredi", Saturday: "Samedi", Sunday: "Dimanche" };

  const handleSave = (e) => {
    e && e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "schedule", label: "Horaires", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Sécurité", icon: Shield },
  ];

  return (
    <VetLayout>
      <div className="p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-[#0e9f6e]">Paramètres</h1>
          <p className="text-gray-600">Gérez votre profil et vos préférences</p>
        </div>

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-2">
            ✅ Modifications enregistrées avec succès !
          </div>
        )}

        <div className="flex gap-6">
          {/* Tabs sidebar */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-[#0e9f6e] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profil */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Informations du profil</h2>
                <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-[#0e9f6e] text-white flex items-center justify-center text-2xl font-bold">MB</div>
                    <div>
                      <p className="font-bold text-lg">{profile.name}</p>
                      <p className="text-gray-500 text-sm">{profile.specialty}</p>
                      <p className="text-gray-400 text-xs">{profile.licenseNumber}</p>
                    </div>
                  </div>

                  {[
                    { key: "name", label: "Nom complet", span: 2 },
                    { key: "email", label: "Email", type: "email" },
                    { key: "phone", label: "Téléphone", type: "tel" },
                    { key: "city", label: "Ville" },
                    { key: "specialty", label: "Spécialité principale" },
                    { key: "licenseNumber", label: "N° de licence", span: 1 },
                    { key: "experience", label: "Années d'expérience", type: "number", span: 1 },
                    { key: "education", label: "Formation / École", span: 2 },
                    { key: "address", label: "Adresse complète", span: 2 },
                    { key: "languages", label: "Langues parlées", span: 2 },
                  ].map(({ key, label, type = "text", span = 1 }) => (
                    <div key={key} className={`col-span-${span}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type={type} value={profile[key]}
                        onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                    </div>
                  ))}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                    <textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                  </div>

                  <div className="col-span-2 pt-4 border-t">
                    <button type="submit" className="flex items-center gap-2 bg-[#0e9f6e] hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                      <Save className="w-4 h-4" /> Enregistrer les modifications
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Horaires */}
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
                            className="w-4 h-4 text-[#0e9f6e]" />
                          <span className={`font-medium text-sm ${config.open ? "text-gray-900" : "text-gray-400"}`}>{dayLabels[day]}</span>
                        </label>
                      </div>
                      {config.open ? (
                        <div className="flex items-center gap-3">
                          <input type="time" value={config.start}
                            onChange={(e) => setSchedule({ ...schedule, [day]: { ...config, start: e.target.value } })}
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                          <span className="text-gray-400">—</span>
                          <input type="time" value={config.end}
                            onChange={(e) => setSchedule({ ...schedule, [day]: { ...config, end: e.target.value } })}
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Fermé</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t mt-6">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-[#0e9f6e] hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                    <Save className="w-4 h-4" /> Enregistrer les horaires
                  </button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Préférences de notifications</h2>
                <div className="space-y-4">
                  {[
                    { key: "newAppointment", label: "Nouveau rendez-vous", desc: "Recevoir une notification pour chaque nouveau RDV" },
                    { key: "appointmentReminder", label: "Rappel de rendez-vous", desc: "Rappel 1h avant chaque consultation" },
                    { key: "newMessage", label: "Nouveau message", desc: "Notification pour les messages des propriétaires" },
                    { key: "newReview", label: "Nouvel avis", desc: "Notification quand un patient laisse un avis" },
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
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0e9f6e] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0e9f6e]"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t mt-6">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-[#0e9f6e] hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                    <Save className="w-4 h-4" /> Enregistrer les préférences
                  </button>
                </div>
              </div>
            )}

            {/* Sécurité */}
            {activeTab === "security" && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-6">Sécurité du compte</h2>
                <form onSubmit={handleSave} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type="password" value={passwords.current} placeholder="••••••••"
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type="password" value={passwords.newPass} placeholder="••••••••"
                        onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input type="password" value={passwords.confirm} placeholder="••••••••"
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e9f6e]" />
                    </div>
                  </div>
                  {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
                    <p className="text-red-500 text-sm">Les mots de passe ne correspondent pas.</p>
                  )}
                  <button type="submit" className="flex items-center gap-2 bg-[#0e9f6e] hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
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