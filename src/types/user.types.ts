/**
 * src/types/user.types.ts
 */
export interface Address {
  _id?:            string;
  // 'type' is the enum category (home / work / other)
  type?:           'home' | 'work' | 'other';
  // 'label' is the optional free-text display name (e.g. "My Home")
  label?:          string;
  recipientName?:  string;
  recipientPhone?: string;
  phoneCountry?:   string;       // 'MV' only (Maldives-only delivery)
  street:          string;
  atoll:           string;
  island:          string;
  // city is auto-derived on the backend as "<island>, <atoll>"
  city?:           string;
  state?:          string;
  zip?:            string;
  country?:        string;
  // GPS coords from map picker — used for Maldives-only delivery validation
  location?: {
    latitude:  number | null;
    longitude: number | null;
  };
  locationLabel?:  string;
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

  isActive?:  boolean;
  lastLogin?: string;
  createdAt?: string;
}