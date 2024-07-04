import { auth, firestore, storage } from '@/firebase/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthday: string;
  bio: string;
  location: string;
  about: string;
  address: string;
  contact: string;
  occupation: string;
  profilePicUrl: string;
}

const ProfilePage = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    birthday: '',
    bio: '',
    location: '',
    about: '',
    address: '',
    contact: '',
    occupation: '',
    profilePicUrl: '',
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setUserName(`${userData.firstName} ${userData.lastName}`);
          setUserEmail(userData.email || '');
          setUserProfile(userData);
        }
      } else {
        console.log('err');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserProfile({ ...userProfile, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    let profilePicUrl = userProfile.profilePicUrl;

    if (profilePic) {
      const storageRef = ref(storage, `profilePics/${user?.uid}`);
      await uploadBytes(storageRef, profilePic);
      profilePicUrl = await getDownloadURL(storageRef);
    }

    const updatedProfile = { ...userProfile, profilePicUrl };

    // Remove undefined fields
    Object.keys(updatedProfile).forEach(key => {
      if (updatedProfile[key as keyof UserProfile] === undefined) {
        delete updatedProfile[key as keyof UserProfile];
      }
    });

    const userDocRef = doc(firestore, 'users', user!.uid);
    await setDoc(userDocRef, updatedProfile, { merge: true });

    setUserProfile(updatedProfile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-4 align-middle text-center">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <div>

      <div className="flex flex-col  mx-auto w-full">
          <div className='flex'>
          <div className="m-8">
                  {userProfile.profilePicUrl ? (
                    <img src={userProfile.profilePicUrl} alt="Profile" className="w-32 h-32 object-cover rounded-full" />
                  ) : (
                    <p>No profile picture</p>
                  )}
                </div>
            <div className="justify-center text-center align-middle" style={{alignContent:"center"}}>
            <p className='text-3xl text-black font-semibold'>
            {userName}
            </p>
          <p className="mx-10 text-slate-800 font-light">
            {userEmail}
          </p>
          </div>
            </div>
          </div>
          <div>
        </div>

      <div className="p-14 bg-white">
        <div className="bg-slate-100 p-4 rounded-lg align-middle justify-center flex">
          <div className="bg-white my-4 p-4 rounded-xl w-2/3">
            <h3 className="text-2xl font-medium my-4">General Information</h3>
            {isEditing ? (
              <div className='p-8'>
                <div className="mb-4">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={userProfile.birthday}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={userProfile.bio}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={userProfile.location}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="about">About</Label>
                  <textarea
                    id="about"
                    name="about"
                    value={userProfile.about}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={userProfile.address}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    name="contact"
                    type="text"
                    value={userProfile.contact}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    type="text"
                    value={userProfile.occupation}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="profilePic">Profile Picture</Label>
                  <Input
                    id="profilePic"
                    name="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <Button onClick={handleSave} className="mr-2">Save</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <div className='p-8 flex flex-col'>
                <div className="mb-4">
                  <Label>Birthday</Label>
                  <p className='font-light'>{userProfile.birthday}</p>
                </div>
                <div className="mb-4">
                  <Label>Bio</Label>
                  <p className='font-light'>{userProfile.bio}</p>
                </div>
                <div className="mb-4">
                  <Label>Location</Label>
                  <p className='font-light'>{userProfile.location}</p>
                </div>
                <div className="mb-4">
                  <Label>About</Label>
                  <p className='font-light'>{userProfile.about}</p>
                </div>
                <div className="mb-4">
                  <Label>Address</Label>
                  <p className='font-light'>{userProfile.address}</p>
                </div>
                <div className="mb-4">
                  <Label>Contact</Label>
                  <p className='font-light'>{userProfile.contact}</p>
                </div>
                <div className="mb-4">
                  <Label>Occupation</Label>
                  <p>{userProfile.occupation}</p>
                </div>
                <div className="mb-4">
                  <Label>Profile Picture</Label>
                  {userProfile.profilePicUrl ? (
                    <img src={userProfile.profilePicUrl} alt="Profile" className="w-32 h-32 object-cover rounded-full" />
                  ) : (
                    <p>No profile picture</p>
                  )}
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
