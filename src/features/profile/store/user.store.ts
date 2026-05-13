// import { create } from 'zustand';
// import type { User } from '@/types/user.types';
// import {
//   getProfileApi,
//   updateProfileApi,
//   updateProfilePictureApi,
//   addAddressApi,
//   updateAddressApi,
// } from '../api/user.api';

// type AddressInput = {
//   street: string;
//   city: string;
//   state?: string;
//   zip?: string;
// };

// interface UserState {
//   user: User | null;
//   loading: boolean;

//   fetchUser: () => Promise<void>;
//   updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
//   updateProfilePic: (formData: FormData) => Promise<void>;
//   addAddress: (data: AddressInput) => Promise<void>;
//   updateAddress: (id: string, data: Partial<AddressInput>) => Promise<void>;
// }

// export const useUserStore = create<UserState>((set) => ({
//   user: null,
//   loading: false,

//   fetchUser: async () => {
//     try {
//       set({ loading: true });
//       const res = await getProfileApi();
//       set({ user: res.user });
//     } catch (err) {
//       console.log("Fetch user error:", err);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   updateProfile: async (data) => {
//     try {
//       const res = await updateProfileApi(data);
//       set({ user: res.user });
//     } catch (err) {
//       console.log("Update profile error:", err);
//     }
//   },

//   updateProfilePic: async (formData) => {
//     try {
//       const res = await updateProfilePictureApi(formData);
//       set({ user: res.user });
//     } catch (err) {
//       console.log("Update pic error:", err);
//     }
//   },

//   addAddress: async (data) => {
//     try {
//       const res = await addAddressApi(data);
//       set({ user: res.user });
//     } catch (err) {
//       console.log("Add address error:", err);
//     }
//   },

//   updateAddress: async (id, data) => {
//     try {
//       const res = await updateAddressApi(id, data);
//       set({ user: res.user });
//     } catch (err) {
//       console.log("Update address error:", err);
//     }
//   },
// }));