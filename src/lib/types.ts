export type Profile = {
  username: string | null;
  avatar_url: string | null;
};

export type Artwork = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string;
  is_hidden?: boolean;
  tags: string[] | null;
  created_at: string;
  profiles: Profile | Profile[] | null;
};

export type ArtworkComment = {
  id: string;
  artwork_id: string;
  user_id: string;
  content: string;
  is_hidden: boolean;
  created_at: string;
  profiles: Profile | Profile[] | null;
};
