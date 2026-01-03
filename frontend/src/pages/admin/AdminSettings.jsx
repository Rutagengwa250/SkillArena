// src/pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Database,
  Users,
  Key,
  AlertCircle,
  RefreshCw,
  Check,
  X
} from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "Skill Arena",
    siteDescription: "Competitive Gaming Platform",
    platformFee: 10,
    minStake: 10,
    maxStake: 10000,
    welcomeBonus: 100,
    maintenanceMode: false,
    emailNotifications: true,
    pushNotifications: false,
    autoPayout: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      // In a real app, you would send this to your API
      // For now, just save to localStorage
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Settings saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      setError("Failed to save settings");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings = {
      siteName: "Skill Arena",
      siteDescription: "Competitive Gaming Platform",
      platformFee: 10,
      minStake: 10,
      maxStake: 10000,
      welcomeBonus: 100,
      maintenanceMode: false,
      emailNotifications: true,
      pushNotifications: false,
      autoPayout: true
    };
    setSettings(defaultSettings);
  };

  const sections = [
    {
      title: "General Settings",
      icon: <Globe className="w-5 h-5" />,
      settings: [
        {
          key: "siteName",
          label: "Site Name",
          type: "text",
          description: "The name displayed throughout the platform"
        },
        {
          key: "siteDescription",
          label: "Site Description",
          type: "textarea",
          description: "Brief description of your platform"
        },
        {
          key: "welcomeBonus",
          label: "Welcome Bonus (tokens)",
          type: "number",
          description: "Tokens given to new users upon registration"
        }
      ]
    },
    {
      title: "Game Settings",
      icon: <CreditCard className="w-5 h-5" />,
      settings: [
        {
          key: "platformFee",
          label: "Platform Fee (%)",
          type: "range",
          min: 1,
          max: 25,
          description: "Percentage taken from each match pot"
        },
        {
          key: "minStake",
          label: "Minimum Stake (tokens)",
          type: "number",
          description: "Minimum tokens required to create a match"
        },
        {
          key: "maxStake",
          label: "Maximum Stake (tokens)",
          type: "number",
          description: "Maximum tokens allowed per match"
        },
        {
          key: "autoPayout",
          label: "Auto Payout",
          type: "toggle",
          description: "Automatically distribute payouts when matches end"
        }
      ]
    },
    {
      title: "System Settings",
      icon: <Database className="w-5 h-5" />,
      settings: [
        {
          key: "maintenanceMode",
          label: "Maintenance Mode",
          type: "toggle",
          description: "Temporarily disable platform for maintenance"
        },
        {
          key: "emailNotifications",
          label: "Email Notifications",
          type: "toggle",
          description: "Send email notifications for system events"
        },
        {
          key: "pushNotifications",
          label: "Push Notifications",
          type: "toggle",
          description: "Enable push notifications in browser"
        }
      ]
    }
  ];

  const renderSettingInput = (setting) => {
    const value = settings[setting.key];
    
    switch (setting.type) {
      case "toggle":
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleChange(setting.key, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {value ? "Enabled" : "Disabled"}
            </span>
          </div>
        );
      
      case "range":
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <input
                type="range"
                min={setting.min}
                max={setting.max}
                value={value}
                onChange={(e) => handleChange(setting.key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-4 text-lg font-bold text-gray-900 dark:text-white">
                {value}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{setting.min}%</span>
              <span>{setting.max}%</span>
            </div>
          </div>
        );
      
      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="3"
          />
        );
      
      default:
        return (
          <input
            type={setting.type}
            value={value}
            onChange={(e) => handleChange(setting.key, setting.type === 'number' ? parseInt(e.target.value) : e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min={setting.min}
            max={setting.max}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Section Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <div className="text-primary-600 dark:text-primary-400">
                    {section.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure {section.title.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {section.settings.map((setting) => (
                  <div key={setting.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </label>
                      {setting.type === "toggle" && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          settings[setting.key] 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                        }`}>
                          {settings[setting.key] ? 'ON' : 'OFF'}
                        </span>
                      )}
                    </div>
                    
                    {renderSettingInput(setting)}
                    
                    {setting.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {setting.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 overflow-hidden">
        <div className="p-6 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Danger Zone</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Critical actions that cannot be undone
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Clear All Logs</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete all system logs
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
                Clear Logs
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Reset Platform</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reset all games and user balances
                </p>
              </div>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700">
                Reset Platform
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Export Database</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download complete database backup
                </p>
              </div>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800">
                Export Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;