    // D:\socialadify\frontend\src\components\EditProfileModal.tsx
    'use client';

    import React, { useState, useEffect, FormEvent } from 'react';
    import { UserPublic, UserProfileUpdateData } from '@/services/authService'; // Import UserProfileUpdateData

    const LoadingSpinner = () => ( /* ... spinner SVG ... */ <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

    interface EditProfileModalProps {
      isOpen: boolean;
      onClose: () => void;
      currentUser: UserPublic | null;
      // Modified: onProfileUpdate now takes UserProfileUpdateData (JSON) instead of FormData
      onProfileUpdate: (profileData: UserProfileUpdateData) => Promise<boolean>; 
    }

    const EditProfileModal: React.FC<EditProfileModalProps> = ({
      isOpen,
      onClose,
      currentUser,
      onProfileUpdate,
    }) => {
      const [firstname, setFirstname] = useState('');
      const [lastname, setLastname] = useState('');
      // REMOVED: profilePicture and picturePreview states
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        if (currentUser) {
          setFirstname(currentUser.firstname || '');
          setLastname(currentUser.lastname || '');
        }
        if (!isOpen) { setError(null); }
      }, [currentUser, isOpen]);

      const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const profileData: UserProfileUpdateData = { firstname, lastname };

        try {
          const success = await onProfileUpdate(profileData); // Pass JSON data
          if (success) {
            onClose(); 
          }
        } catch (apiErr: unknown) {
          if (apiErr instanceof Error) { setError(apiErr.message); } 
          else { setError("An unexpected error occurred."); }
        } finally {
          setIsLoading(false);
        }
      };

      if (!isOpen) return null;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Edit Profile</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile Picture Upload Section REMOVED */}

              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text" id="firstname" value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text" id="lastname" value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  disabled={isLoading}
                />
              </div>
              
              {error && ( <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-200">{error}</div> )}

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 transition">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition shadow-sm disabled:opacity-70 flex items-center justify-center">
                  {isLoading ? <LoadingSpinner /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    export default EditProfileModal;
    