import { baseApi } from '@/app/api/baseApi';
import { AUTH_KEYS } from '@/common/constants';
import { withZodCatch } from '@/common/utils';
import { loginResponseSchema, meResponseSchema } from '../model/auth.schemas';
import type { LoginArgs } from './authApi.types';

export const authApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
		getMe: build.query({
			query: () => `auth/me`,
			...withZodCatch(meResponseSchema),
			providesTags: ['Auth']
		}),
		login: build.mutation({
			query: (payload: LoginArgs) => ({
				url: `auth/login`,
				method: 'post',
				body: { ...payload, accessTokenTTL: '30m' }
			}),
			async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
				const { data } = await queryFulfilled;
				localStorage.setItem(AUTH_KEYS.accessToken, data.accessToken);
				localStorage.setItem(AUTH_KEYS.refreshToken, data.refreshToken);

				// Invalidate after saving tokens
				dispatch(authApi.util.invalidateTags(['Auth']));
			},
			...withZodCatch(loginResponseSchema)
		}),
		logout: build.mutation<void, void>({
			query: () => {
				const refreshToken = localStorage.getItem(AUTH_KEYS.refreshToken);
				return { url: 'auth/logout', method: 'post', body: { refreshToken } };
			},
			async onQueryStarted(_args, { queryFulfilled, dispatch }) {
				await queryFulfilled;
				localStorage.removeItem(AUTH_KEYS.accessToken);
				localStorage.removeItem(AUTH_KEYS.refreshToken);
				dispatch(baseApi.util.resetApiState());
			}
		})
	})
});

export const { useGetMeQuery, useLoginMutation, useLogoutMutation } = authApi;
