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

// Type local pour l'édition (frontend uniquement)
export interface EditableLink extends Link {
  preview?: string | null;
  newIcon?: File | null;
}
