"use client";

import MainLayout from '@/components/layout/MainLayout';
import CapitalSection from '@/components/settings/CapitalSection';
import ProfileSection from '@/components/settings/ProfileSection';
import SecuritySection from '@/components/settings/SecuritySection';
import SettingsActionBar from '@/components/settings/SettingsActionBar';
import SettingsHeader from '@/components/settings/SettingsHeader';
import { useGetMeQuery, useUpdateProfileMutation } from '@/features/auth/authApi';
import { useCallback, useEffect, useState } from 'react';
import Loading from '../../components/Loading/Loading';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { data, isLoading } = useGetMeQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Profile States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Capital States
  const [initialCapital, setInitialCapital] = useState<string>('0');
  const [sessionDate, setSessionDate] = useState<Date | undefined>(new Date());

  // Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUploading, setIsUploading] = useState<'profile' | 'cover' | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data?.user) {
      if (!name) setName(data.user.name || '');
      if (!username) setUsername(data.user.username || '');
      if (!bio) setBio(data.user.bio || '');
      if (!profileImage) setProfileImage(data.user.profileImage || '');
      if (!coverImage) setCoverImage(data.user.coverImage || '');

      if (initialCapital === '0' && data.user.initialCapital !== undefined) {
        setInitialCapital(data.user.initialCapital.toString());
      }
      if (data.user.capitalUpdateDate) {
        setSessionDate(new Date(data.user.capitalUpdateDate));
      }
    }
  }, [data, bio, coverImage, initialCapital, name, profileImage, username]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(type);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.url) {
        if (type === 'profile') setProfileImage(result.url);
        else setCoverImage(result.url);
        setMessage({ text: `${type === 'profile' ? 'Profile' : 'Cover'} image uploaded!`, type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image.';
      setMessage({ text: errorMessage, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsUploading(null);
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile({
        name,
        username,
        bio,
        profileImage,
        coverImage,
        initialCapital: parseFloat(initialCapital) || 0,
        capitalUpdateDate: sessionDate?.toISOString(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      }).unwrap();

      setMessage({ text: 'Settings updated successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      // RTK Query errors can be complex, but let's try to extract a message
      const errorMessage = (err as { data?: { error?: string } })?.data?.error || 'Failed to update settings.';
      setMessage({ text: errorMessage, type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  }, [name, username, bio, profileImage, coverImage, initialCapital, sessionDate, currentPassword, newPassword, updateProfile]);

  if (!mounted) return null;

  return (
    <MainLayout>
      {
        isLoading ? (
          <Loading />
        ) : (
          <div className="space-y-8 pb-10">
            <SettingsHeader
              name={name}
              username={username}
              profileImage={profileImage}
              coverImage={coverImage}
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
            />

            <SettingsActionBar
              sessionDate={sessionDate}
              message={message}
              isUpdating={isUpdating}
              handleSave={handleSave}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <ProfileSection
                  name={name}
                  setName={setName}
                  username={username}
                  setUsername={setUsername}
                  bio={bio}
                  setBio={setBio}
                />

                <SecuritySection
                  currentPassword={currentPassword}
                  setCurrentPassword={setCurrentPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                />
              </div>

              <div className="space-y-8">
                <CapitalSection
                  initialCapital={initialCapital}
                  setInitialCapital={setInitialCapital}
                  sessionDate={sessionDate}
                  setSessionDate={setSessionDate}
                />
              </div>
            </div>
          </div>
        )
      }
    </MainLayout>
  );
}
