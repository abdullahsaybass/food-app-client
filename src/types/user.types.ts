/**
 * src/types/user.types.ts
 */
export interface Address {
  _id?:            string;
  label?:          'home' | 'work' | 'other'; // ✅ narrow the type
  type?:           'home' | 'work' | 'other';
  fullName?:       string;
  recipientName?:  string;
  phone?:          string;
  recipientPhone?: string;
  street:          string;
  city:            string;
  state?:          string;
  postalCode?:     string;
  zip?:            string;
  country?:        string;
  isDefault?:      boolean;
}
export interface User {
  _id:    string;
  name:   string;
  email:  string;
  phone?: string;
  role:   string;

  addresses?: Address[];

  profilePic?: {
    url?:      string;
    publicId?: string;
  };

  isActive?:        boolean;
  isEmailVerified?: boolean;
}