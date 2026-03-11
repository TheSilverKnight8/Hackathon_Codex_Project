export type SignedInUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type AuthSession = {
  user: SignedInUser;
  expiresAt: number;
};
