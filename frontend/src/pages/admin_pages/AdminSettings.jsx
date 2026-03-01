import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Save, 
  Upload,
  Settings,
  
  Shield,
  
  Palette,
  Bell,
  Database,
  Key,
  Users,
  
  Store,
  
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState({});
  const [settings, setSettings] = useState({
    // Paramètres généraux
    siteName: 'Cheebo',
    siteDescription: 'Plateforme dédiée aux amoureux des animaux',
    siteUrl: 'https://cheebo.com',
    adminEmail: 'admin@cheebo.com',
    
    // Paramètres de sécurité
    twoFactorAuth: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    
    // Paramètres de notification
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    weeklyReports: true,
    
    // Paramètres de modération
    autoModeration: true,
    badWordsFilter: true,
    imageModeration: true,
    maxPostsPerDay: 10,
    
    // Paramètres e-commerce
    currency: 'EUR',
    taxRate: 20,
    freeShippingThreshold: 50,
    returnPeriod: 14,
    
    // Paramètres d'apparence
    primaryColor: '#8657ff',
    secondaryColor: '#f3f4f6',
    darkMode: false,
    customLogo: null,
    
    // API Keys
    emailApiKey: '',
    smsApiKey: '',
    paymentApiKey: '',
    cloudinaryApiKey: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'moderation', label: 'Modération', icon: Users },
    { id: 'ecommerce', label: 'E-commerce', icon: Store },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'integrations', label: 'Intégrations', icon: Key }
  ];

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulation de la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Paramètres sauvegardés avec succès !');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Erreur lors de la sauvegarde');
    }
    setIsSaving(false);
  };

  const handleBackup = async () => {
    try {
      const backupData = {
        settings,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `cheebo-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du site
        </label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description du site
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL du site
        </label>
        <input
          type="url"
          value={settings.siteUrl}
          onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email administrateur
        </label>
        <input
          type="email"
          value={settings.adminEmail}
          onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Authentification à deux facteurs</h3>
          <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.twoFactorAuth}
            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Délai d'expiration de session (minutes)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tentatives de connexion maximales
        </label>
        <input
          type="number"
          value={settings.maxLoginAttempts}
          onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Longueur minimale du mot de passe
        </label>
        <input
          type="number"
          value={settings.passwordMinLength}
          onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Caractères spéciaux obligatoires</h3>
          <p className="text-sm text-gray-500">Exiger des caractères spéciaux dans les mots de passe</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.requireSpecialChars}
            onChange={(e) => handleInputChange('security', 'requireSpecialChars', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Notifications par email</h3>
          <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Notifications push</h3>
          <p className="text-sm text-gray-500">Recevoir les notifications push sur navigateur</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Notifications SMS</h3>
          <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.smsNotifications}
            onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Rapports hebdomadaires</h3>
          <p className="text-sm text-gray-500">Recevoir un rapport d'activité chaque semaine</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.weeklyReports}
            onChange={(e) => handleInputChange('notifications', 'weeklyReports', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
    </div>
  );

  const renderModerationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Modération automatique</h3>
          <p className="text-sm text-gray-500">Activer la modération automatique des contenus</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoModeration}
            onChange={(e) => handleInputChange('moderation', 'autoModeration', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Filtre de mots inappropriés</h3>
          <p className="text-sm text-gray-500">Filtrer automatiquement les mots inappropriés</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.badWordsFilter}
            onChange={(e) => handleInputChange('moderation', 'badWordsFilter', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Modération d'images</h3>
          <p className="text-sm text-gray-500">Vérifier automatiquement le contenu des images</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.imageModeration}
            onChange={(e) => handleInputChange('moderation', 'imageModeration', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Posts maximum par jour par utilisateur
        </label>
        <input
          type="number"
          value={settings.maxPostsPerDay}
          onChange={(e) => handleInputChange('moderation', 'maxPostsPerDay', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderEcommerceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Devise
        </label>
        <select
          value={settings.currency}
          onChange={(e) => handleInputChange('ecommerce', 'currency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        >
          <option value="EUR">Euro (€)</option>
          <option value="USD">Dollar US ($)</option>
          <option value="GBP">Livre Sterling (£)</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Taux de TVA (%)
        </label>
        <input
          type="number"
          step="0.1"
          value={settings.taxRate}
          onChange={(e) => handleInputChange('ecommerce', 'taxRate', parseFloat(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seuil de livraison gratuite (€)
        </label>
        <input
          type="number"
          value={settings.freeShippingThreshold}
          onChange={(e) => handleInputChange('ecommerce', 'freeShippingThreshold', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Période de retour (jours)
        </label>
        <input
          type="number"
          value={settings.returnPeriod}
          onChange={(e) => handleInputChange('ecommerce', 'returnPeriod', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur principale
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={settings.primaryColor}
            onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={settings.primaryColor}
            onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur secondaire
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={settings.secondaryColor}
            onChange={(e) => handleInputChange('appearance', 'secondaryColor', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={settings.secondaryColor}
            onChange={(e) => handleInputChange('appearance', 'secondaryColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Mode sombre</h3>
          <p className="text-sm text-gray-500">Activer le thème sombre par défaut</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) => handleInputChange('appearance', 'darkMode', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8657ff]"></div>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo personnalisé
        </label>
        <div className="flex items-center space-x-3">
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
            <Upload className="w-4 h-4" />
            Télécharger
          </button>
          <span className="text-sm text-gray-500">
            {settings.customLogo ? 'Logo personnalisé uploadé' : 'Aucun logo personnalisé'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clé API Email (SendGrid/Mailgun)
        </label>
        <div className="relative">
          <input
            type={showPassword.emailApiKey ? "text" : "password"}
            value={settings.emailApiKey}
            onChange={(e) => handleInputChange('integrations', 'emailApiKey', e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('emailApiKey')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword.emailApiKey ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clé API SMS (Twilio)
        </label>
        <div className="relative">
          <input
            type={showPassword.smsApiKey ? "text" : "password"}
            value={settings.smsApiKey}
            onChange={(e) => handleInputChange('integrations', 'smsApiKey', e.target.value)}
            placeholder="AC..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('smsApiKey')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword.smsApiKey ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clé API Paiement (Stripe)
        </label>
        <div className="relative">
          <input
            type={showPassword.paymentApiKey ? "text" : "password"}
            value={settings.paymentApiKey}
            onChange={(e) => handleInputChange('integrations', 'paymentApiKey', e.target.value)}
            placeholder="pk_..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('paymentApiKey')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword.paymentApiKey ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clé API Cloudinary (Images)
        </label>
        <div className="relative">
          <input
            type={showPassword.cloudinaryApiKey ? "text" : "password"}
            value={settings.cloudinaryApiKey}
            onChange={(e) => handleInputChange('integrations', 'cloudinaryApiKey', e.target.value)}
            placeholder="123456789012345"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8657ff] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('cloudinaryApiKey')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword.cloudinaryApiKey ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Sécurité des clés API
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Gardez vos clés API secrètes et ne les partagez jamais. 
                Utilisez des variables d'environnement en production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'moderation':
        return renderModerationSettings();
      case 'ecommerce':
        return renderEcommerceSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <AdminLayout>
      <div className="p-10">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-[#8657ff]">Paramètres Système</h1>
            <p className="text-gray-600">Configurez les paramètres de votre plateforme</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleBackup}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Database className="w-4 h-4" />
              Sauvegarder
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#8657ff] hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Message de sauvegarde */}
        {saveMessage && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>{saveMessage}</span>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar des onglets */}
          <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#8657ff] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Configurez les paramètres de cette section
              </p>
            </div>
            
            {renderTabContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;