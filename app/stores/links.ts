import { defineStore } from 'pinia';
import type { Link, CreateLink } from '~/types/links';

interface LinksState {
  links: Link[];
  loading: boolean;
  error: string | null;
}

export const useLinksStore = defineStore('links', {
  state: (): LinksState => ({
    links: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalLinks: (state) => state.links.length,
    getLinkById: (state) => (id: number) =>
      state.links.find((l) => l.id === id),
  },

  actions: {
    async fetchLinks() {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch<{ data: Link[] }>('/api/links', {
          method: 'GET',
        });
        this.links = response.data;

        return this.links;
      } catch (err: any) {
        this.error =
          err?.data?.message || 'Erreur lors de la récupération des liens';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createLink(newLink: CreateLink) {
      this.loading = true;
      this.error = null;
      try {
        // Utilisation de FormData pour gérer l'upload
        const formData = new FormData();
        formData.append('title', newLink.title);
        formData.append('url', newLink.url);
        formData.append('icon', newLink.icons);

        const response = await $fetch<{ data: Link }>('/api/links', {
          method: 'POST',
          body: formData,
        });

        this.links.push(response.data);
        return response.data;
      } catch (err: any) {
        this.error = err?.data?.message || 'Erreur lors de la création du lien';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateLink(
      id: number,
      updateData: Partial<CreateLink & { title?: string; url?: string }>
    ) {
      this.loading = true;
      this.error = null;
      try {
        const formData = new FormData();
        if (updateData.title) formData.append('title', updateData.title);
        if (updateData.url) formData.append('url', updateData.url);
        if (updateData.icons) formData.append('icon', updateData.icons);

        const response = await $fetch<{ data: Link }>(`/api/links/${id}`, {
          method: 'PATCH',
          body: formData,
        });

        const index = this.links.findIndex((l) => l.id === id);
        if (index !== -1) this.links[index] = response.data;

        return response.data;
      } catch (err: any) {
        this.error =
          err?.data?.message || 'Erreur lors de la mise à jour du lien';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteLink(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await $fetch(`/api/links/${id}`, { method: 'DELETE' });
        this.links = this.links.filter((l) => l.id !== id);
      } catch (err: any) {
        this.error =
          err?.data?.message || 'Erreur lors de la suppression du lien';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
