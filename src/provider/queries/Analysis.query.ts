import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const AnalysisApi = createApi({
  reducerPath: 'AnalysisApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL.trim() }), // 👈 use .trim()
  endpoints: (builder) => ({
    uploadAndAnalyzeCSV: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/ml/analyze',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const { useUploadAndAnalyzeCSVMutation } = AnalysisApi;
