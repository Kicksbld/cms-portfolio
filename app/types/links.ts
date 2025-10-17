export interface Link {
  id: number;
  title: string;
  url: string;
  icon: string;
}

export interface CreateLink {
  title: string;
  url: string;
  icon: File;
}
