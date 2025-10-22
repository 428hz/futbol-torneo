import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import type { RootState } from '../store';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ['Teams', 'Players', 'Matches', 'Users', 'Venues', 'Stats'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<{ token: string; user: any }, { email: string; password: string; pushToken?: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body })
    }),
    register: builder.mutation<{ token: string; user: any }, any>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body })
    }),
    googleLogin: builder.mutation<{ token: string; user: any }, { idToken: string; pushToken?: string }>({
      query: (body) => ({ url: '/auth/google/token', method: 'POST', body })
    }),
    getMe: builder.query<{ user: any }, void>({
    query: () => '/auth/me',
  }),

    // Queries públicas
    getTeams: builder.query<any[], void>({ query: () => '/teams', providesTags: ['Teams'] }),
    getPlayers: builder.query<any[], void>({ query: () => '/players', providesTags: ['Players'] }),
    getUpcomingMatches: builder.query<any[], void>({ query: () => '/matches/upcoming', providesTags: ['Matches'] }),
    getFixture: builder.query<any[], void>({ query: () => '/matches', providesTags: ['Matches'] }),
    getStandings: builder.query<any[], void>({ query: () => '/stats/standings', providesTags: ['Stats'] }),
    getTopScorers: builder.query<any[], void>({ query: () => '/stats/top-scorers', providesTags: ['Stats'] }),
    getVenues: builder.query<any[], void>({ query: () => '/venues', providesTags: ['Venues'] }),

    // Admin: Teams
    createTeam: builder.mutation<any, { name: string; crestUrl?: string }>({
      query: (body) => ({ url: '/teams', method: 'POST', body }),
      invalidatesTags: ['Teams', 'Stats']
    }),
    updateTeam: builder.mutation<any, { id: number; name: string; crestUrl?: string }>({
      query: ({ id, ...rest }) => ({ url: `/teams/${id}`, method: 'PUT', body: rest }),
      invalidatesTags: ['Teams', 'Stats']
    }),
    deleteTeam: builder.mutation<void, number>({
      query: (id) => ({ url: `/teams/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Teams', 'Stats']
    }),

    // Admin: Players
    createPlayer: builder.mutation<any, any>({
      query: (body) => ({ url: '/players', method: 'POST', body }),
      invalidatesTags: ['Players']
    }),
    updatePlayer: builder.mutation<any, { id: number } & any>({
      query: ({ id, ...rest }) => ({ url: `/players/${id}`, method: 'PUT', body: rest }),
      invalidatesTags: ['Players']
    }),
    deletePlayer: builder.mutation<void, number>({
      query: (id) => ({ url: `/players/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Players']
    }),

    // Admin: Venues
    createVenue: builder.mutation<any, any>({
      query: (body) => ({ url: '/venues', method: 'POST', body }),
      invalidatesTags: ['Venues']
    }),
    updateVenue: builder.mutation<any, { id: number } & any>({
      query: ({ id, ...rest }) => ({ url: `/venues/${id}`, method: 'PUT', body: rest }),
      invalidatesTags: ['Venues']
    }),
    deleteVenue: builder.mutation<void, number>({
      query: (id) => ({ url: `/venues/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Venues']
    }),

    // Admin: Matches
    createMatch: builder.mutation<any, { homeTeamId: number; awayTeamId: number; venueId: number; datetime: string }>({
      query: (body) => ({ url: '/matches', method: 'POST', body }),
      invalidatesTags: ['Matches', 'Stats']
    }),
    addMatchEvent: builder.mutation<any, { id: number; teamId: number; playerId?: number; minute: number; type: 'goal'|'yellow'|'red'; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `/matches/${id}/events`, method: 'POST', body }),
      invalidatesTags: ['Matches', 'Stats']
    }),
    finishMatch: builder.mutation<any, number>({
      query: (id) => ({ url: `/matches/${id}/finish`, method: 'POST' }),
      invalidatesTags: ['Matches', 'Stats']
    }),

    // Admin: Users
    getUsers: builder.query<any[], void>({ query: () => '/users', providesTags: ['Users'] }),
    updateUser: builder.mutation<any, { id: number } & any>({
      query: ({ id, ...rest }) => ({ url: `/users/${id}`, method: 'PUT', body: rest }),
      invalidatesTags: ['Users']
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users']
    }),

    // Notifications
    notifyBroadcast: builder.mutation<{ sent: number; tokens: number }, { title: string; body: string }>({
      query: (body) => ({ url: '/notifications/broadcast', method: 'POST', body })
    }),
  })
});

export const {
  useLoginMutation, useRegisterMutation, useGoogleLoginMutation,
  useGetTeamsQuery, useGetPlayersQuery, useGetUpcomingMatchesQuery, useGetFixtureQuery,
  useGetStandingsQuery, useGetTopScorersQuery, useGetVenuesQuery,
  useCreateTeamMutation, useUpdateTeamMutation, useDeleteTeamMutation,
  useCreatePlayerMutation, useUpdatePlayerMutation, useDeletePlayerMutation,
  useCreateVenueMutation, useUpdateVenueMutation, useDeleteVenueMutation,
  useCreateMatchMutation, useAddMatchEventMutation, useFinishMatchMutation,
  useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation,
  useNotifyBroadcastMutation,useGetMeQuery
} = api;