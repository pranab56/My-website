import { baseApi } from '../api/baseApi';

export interface GalleryItem {
  _id: string;
  data: string;
  type: 'image' | 'video' | 'youtube';
  fileName: string;
  mimeType: string;
  size: number;
  folder: string;
  createdAt: string;
}

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query<GalleryItem[], void>({
      query: () => '/api/gallery',
      providesTags: ['Gallery'],
    }),
    uploadToGallery: builder.mutation({
      query: (formData) => ({
        url: '/api/gallery',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Gallery'],
    }),
    updateGallery: builder.mutation<GalleryItem, { id: string; fileName?: string; folder?: string }>({
      query: ({ id, ...patch }) => ({
        url: `/api/gallery/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Gallery'],
    }),
    deleteFromGallery: builder.mutation({
      query: (id) => ({
        url: `/api/gallery/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Gallery'],
    }),
  }),
});

export const {
  useGetGalleryQuery,
  useUploadToGalleryMutation,
  useUpdateGalleryMutation,
  useDeleteFromGalleryMutation,
} = galleryApi;
