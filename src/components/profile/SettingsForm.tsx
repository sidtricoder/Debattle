import React, { useEffect, useState } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';

type ThemeType = 'light' | 'dark' | 'auto';
interface Notifications {
  email: boolean;
  push: boolean;
  debate_invites: boolean;
  achievements: boolean;
}
interface Privacy {
  profile_visible: boolean;
  show_rating: boolean;
  show_stats: boolean;
}
interface SettingsFormState {
  theme: ThemeType;
  notifications: Notifications;
  privacy: Privacy;
}

const SettingsForm: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState<SettingsFormState>({
    theme: (user?.preferences?.theme as ThemeType) || 'auto',
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
      debate_invites: user?.preferences?.notifications?.debate_invites ?? true,
      achievements: user?.preferences?.notifications?.achievements ?? true,
    },
    privacy: {
      profile_visible: user?.preferences?.privacy?.profile_visible ?? true,
      show_rating: user?.preferences?.privacy?.show_rating ?? true,
      show_stats: user?.preferences?.privacy?.show_stats ?? true,
    },
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm({
      theme: user?.preferences?.theme || 'auto',
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        push: user?.preferences?.notifications?.push ?? true,
        debate_invites: user?.preferences?.notifications?.debate_invites ?? true,
        achievements: user?.preferences?.notifications?.achievements ?? true,
      },
      privacy: {
        profile_visible: user?.preferences?.privacy?.profile_visible ?? true,
        show_rating: user?.preferences?.privacy?.show_rating ?? true,
        show_stats: user?.preferences?.privacy?.show_stats ?? true,
      },
    });
  }, [user]);

  const handleChange = <T extends keyof SettingsFormState>(section: T, key: keyof SettingsFormState[T], value: any) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(typeof prev[section] === 'object' && prev[section] !== null ? prev[section] : {}),
        [key]: value,
      },
    }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, theme: e.target.value as ThemeType }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateProfile({ preferences: form });
      setSuccess(true);
    } catch (err) {
      // Optionally show error
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
        <select
          value={form.theme}
          onChange={handleThemeChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h3>
        <div className="space-y-2">
          {Object.entries(form.notifications).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={e => handleChange('notifications', key as keyof Notifications, e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {key.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy</h3>
        <div className="space-y-2">
          {Object.entries(form.privacy).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={e => handleChange('privacy', key as keyof Privacy, e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {key.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
      {success && (
        <div className="text-green-600 text-center mt-2">Settings saved!</div>
      )}
    </form>
  );
};

export default SettingsForm;
