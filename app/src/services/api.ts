import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };
if (typeof window !== 'undefined') { (window as any).setToken = setToken; }

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ['Teams','Players','Matches','Users','Venues','Stats','MatchEvents'],
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

    // Lecturas
    getTeams: builder.query<any[], void>({
      query: () => '/teams',
      providesTags: (r) => r ? [...r.map((t:any)=>({type:'Teams' as const,id:t.id})),{type:'Teams',id:'LIST'}] : [{type:'Teams',id:'LIST'}]
    }),
    getPlayers: builder.query<any[], void>({
      query: () => '/players',
      providesTags: (r) => r ? [...r.map((p:any)=>({type:'Players' as const,id:p.id})),{type:'Players',id:'LIST'}] : [{type:'Players',id:'LIST'}]
    }),
    getVenues: builder.query<any[], void>({
      query: () => '/venues',
      providesTags: (r) => r ? [...r.map((v:any)=>({type:'Venues' as const,id:v.id})),{type:'Venues',id:'LIST'}] : [{type:'Venues',id:'LIST'}]
    }),
    createVenue: builder.mutation<any, { name: string; address: string; latitude: number; longitude: number }>({
      query: (body) => ({ url: '/venues', method: 'POST', body }),
      invalidatesTags: [{ type: 'Venues', id: 'LIST' }]
    }),

    getUpcomingMatches: builder.query<any[], void>({
      query: () => '/matches/upcoming',
      providesTags: [{ type: 'Matches', id: 'LIST' }]
    }),
    getFixture: builder.query<any[], void>({
      query: () => '/matches',
      providesTags: (r) => r ? [...r.map((m:any)=>({type:'Matches' as const,id:m.id})),{type:'Matches',id:'LIST'}] : [{type:'Matches',id:'LIST'}]
    }),

    // Partidos ABM
    createMatch: builder.mutation<any, { homeTeamId: number; awayTeamId: number; venueId: number; datetime: string }>({
      query: (body) => ({ url: '/matches', method: 'POST', body }),
      invalidatesTags: [{ type:'Matches', id:'LIST' }]
    }),
    finishMatch: builder.mutation<any, number>({
      query: (id) => ({ url: `/matches/${id}/finish`, method: 'POST' }),
      invalidatesTags: (r,e,id)=>[
        { type:'Matches', id }, { type:'Matches', id:'LIST' }, { type:'Stats', id:'STANDINGS' }
      ]
    }),

    // Eventos de partido
    createMatchEvent: builder.mutation<any, { matchId: number; teamId: number; playerId?: number; type: 'goal'|'yellow'|'red'; minute?: number }>({
      query: ({ matchId, ...body }) => ({ url: `/matches/${matchId}/events`, method: 'POST', body }),
      invalidatesTags: (r,e,arg)=>[
        { type:'Matches', id: arg.matchId }, { type:'Matches', id:'LIST' }, { type:'MatchEvents', id: arg.matchId }
      ]
    }),
    deleteMatchEvent: builder.mutation<any, { matchId: number; eventId: number }>({
      query: ({ matchId, eventId }) => ({ url: `/matches/${matchId}/events/${eventId}`, method: 'DELETE' }),
      invalidatesTags: (r,e,arg)=>[
        { type:'Matches', id: arg.matchId }, { type:'Matches', id:'LIST' }, { type:'MatchEvents', id: arg.matchId }
      ]
    }),

    // Jugadores
    createPlayer: builder.mutation<any, {
      firstName: string; lastName: string; age: number; position: string; jerseyNumber: number; teamId: number; photoUrl?: string;
    }>({
      query: (body) => ({ url: '/players', method: 'POST', body }),
      invalidatesTags: [{ type:'Players', id:'LIST' }, { type:'Stats', id:'TOPSCORERS' }]
    }),
    updatePlayer: builder.mutation<any, { id: number } & Partial<{
      firstName: string; lastName: string; age: number; position: string; jerseyNumber: number; teamId: number; photoUrl?: string;
    }>>({
      query: ({ id, ...body }) => ({ url: `/players/${id}`, method: 'PUT', body }),
      invalidatesTags: (r,e,arg)=>[
        { type:'Players', id: arg.id }, { type:'Players', id:'LIST' }, { type:'Stats', id:'TOPSCORERS' }
      ]
    }),
    deletePlayer: builder.mutation<void, number>({
      query: (id) => ({ url: `/players/${id}`, method: 'DELETE' }),
      invalidatesTags: (r,e,id)=>[
        { type:'Players', id }, { type:'Players', id:'LIST' }, { type:'Stats', id:'TOPSCORERS' }
      ]
    }),

    // Usuarios, Equipos… (resto igual si ya lo tenías)
  })
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGoogleLoginMutation,

  useGetTeamsQuery,
  useGetPlayersQuery,
  useGetVenuesQuery,
  useGetUpcomingMatchesQuery,
  useGetFixtureQuery,

  useCreateVenueMutation,

  useCreateMatchMutation,
  useFinishMatchMutation,

  useCreateMatchEventMutation,
  useDeleteMatchEventMutation,

  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
} = api;