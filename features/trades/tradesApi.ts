import { baseApi } from '../api/baseApi';

export const tradesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrades: builder.query({
      query: () => '/api/trades',
      providesTags: ['Trades'],
    }),
    addTrade: builder.mutation({
      query: (newTrade) => ({
        url: '/api/trades',
        method: 'POST',
        body: newTrade,
      }),
      invalidatesTags: ['Trades', 'Analytics'],
    }),
    updateTrade: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/trades/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Trades', 'Analytics'],
    }),
    deleteTrade: builder.mutation({
      query: (id) => ({
        url: `/api/trades/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Trades', 'Analytics'],
    }),
    getAnalytics: builder.query({
      query: (date?: string) => `/api/analytics${date ? `?date=${date}` : ''}`,
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetTradesQuery,
  useAddTradeMutation,
  useUpdateTradeMutation,
  useDeleteTradeMutation,
  useGetAnalyticsQuery
} = tradesApi;
