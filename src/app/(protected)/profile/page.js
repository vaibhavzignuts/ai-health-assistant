'use client'
import { useState, useEffect } from 'react'; 
import { getUserProfile , updateUserProfile } from '@/utils/profileService';
import { useProtectedProfile } from '@/hooks/useProtectedProfile';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';
import { ProfileEditPage } from '@/components/ProfileEditPage';

export default function ProfilePage() {
  const router = useRouter();


    const {  profile, loading , setProfile } = useProtectedProfile()

 



  const handleSave = async (profileData) => {
    try {
      const updatedProfile = await updateUserProfile(profile.id, profileData);
      setProfile(updatedProfile);
      router.push('/dashboard'); 
    } catch (error) {
      console.error('Error saving profile:', error);
  
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return <Loader/>;
  }

  return (
    <ProfileEditPage
      initialProfile={profile}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}