'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Save, Bell, Moon, Globe, Target, User } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    reminderTime: '20:00',
    theme: 'light',
    uiLanguage: 'English',
  });
  const [profile, setProfile] = useState({
    name: '',
    dailyGoalMinutes: 10,
    targetLanguage: 'Spanish',
    nativeLanguage: 'English',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name ?? '',
        dailyGoalMinutes: session.user.dailyGoalMinutes ?? 10,
        targetLanguage: session.user.targetLanguage ?? 'Spanish',
        nativeLanguage: session.user.nativeLanguage ?? 'English',
      });
    }
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        }),
        fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // handle error
    } finally {
      setIsSaving(false);
    }
  };

  const LANGUAGES = ['Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Mandarin', 'Korean', 'Arabic', 'Russian'];
  const DAILY_GOALS = [5, 10, 15, 20, 30, 45, 60];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={session?.user?.email ?? ''}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Learning */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Learning</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Language</label>
            <select
              value={profile.targetLanguage}
              onChange={(e) => setProfile({ ...profile, targetLanguage: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Native Language</label>
            <select
              value={profile.nativeLanguage}
              onChange={(e) => setProfile({ ...profile, nativeLanguage: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Daily Goal</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {DAILY_GOALS.map((mins) => (
            <button
              key={mins}
              onClick={() => setProfile({ ...profile, dailyGoalMinutes: mins })}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                profile.dailyGoalMinutes === mins
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-300'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">Daily Reminders</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Get reminded to practice every day</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings.notificationsEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: settings.notificationsEnabled ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
              />
            </button>
          </div>
          {settings.notificationsEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reminder Time</label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-success-DEFAULT text-sm font-medium"
          >
            ✓ Saved successfully!
          </motion.p>
        )}
      </div>
    </div>
  );
}
