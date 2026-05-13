export type Address = {
  label?: 'home' | 'work' | 'other';  // ← add this
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;                 // ✅ already added
};
export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;

  addresses?: Address[]; // ✅ ADD THIS
  profilePic?: {
    url: string | null;
    publicId: string | null;
  };

  isActive?: boolean;
  isEmailVerified?: boolean;
};