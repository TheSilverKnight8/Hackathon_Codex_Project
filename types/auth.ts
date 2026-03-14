export type SignedInUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type AuthSession = {
  sessionId: string;
  user: SignedInUser;
  expiresAt: number;
};
