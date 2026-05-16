export interface AvatarConfig {
  baseSkin: string;
  hair?: string;
  eyes?: string;
  outfit?: string;
  background?: string;
  accessories?: string[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  xp: number;
  avatarConfig: AvatarConfig;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  level: number;
  avatarConfig: AvatarConfig;
}
