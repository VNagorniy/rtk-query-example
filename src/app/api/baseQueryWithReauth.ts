import { baseApi } from '@/app/api/baseApi.ts';
import { AUTH_KEYS } from '@/common/constants';
import { handleErrors, isTokens } from '@/common/utils';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { baseQuery } from './baseQuery';

// Создаём новый мьютекс для управления параллельными запросами на обновление токена
const mutex = new Mutex();

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
	// Ждём завершения любого текущего процесса обновления токена (если мьютекс заблокирован)
	await mutex.waitForUnlock();

	// Выполняем исходный запрос к API
	let result = await baseQuery(args, api, extraOptions);

	// Если запрос завершился ошибкой 401 Unauthorized
	if (result.error && result.error.status === 401) {
		// Проверяем, что мьютекс ещё не заблокирован (то есть другой процесс обновления токена не идёт)
		if (!mutex.isLocked()) {
			// Блокируем мьютекс, чтобы только один процесс обновления токена выполнялся в данный момент
			const release = await mutex.acquire();
			try {
				const refreshToken = localStorage.getItem(AUTH_KEYS.refreshToken);

				const refreshResult = await baseQuery({ url: '/auth/refresh', method: 'post', body: { refreshToken } }, api, extraOptions);

				if (refreshResult.data && isTokens(refreshResult.data)) {
					localStorage.setItem(AUTH_KEYS.accessToken, refreshResult.data.accessToken);
					localStorage.setItem(AUTH_KEYS.refreshToken, refreshResult.data.refreshToken);
					// Повторяем исходный запрос с новым access token
					result = await baseQuery(args, api, extraOptions);
				} else {
					// Если обновление токена не удалось — выполняем выход из системы
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					api.dispatch(baseApi.endpoints.logout.initiate());
				}
			} finally {
				// Всегда освобождаем мьютекс после завершения обновления токена
				release();
			}
		} else {
			// Если процесс обновления токена уже идёт — ждём его завершения
			await mutex.waitForUnlock();
			// После обновления токенов повторяем исходный запрос
			result = await baseQuery(args, api, extraOptions);
		}
	}

	// Обрабатываем все ошибки, кроме 401 Unauthorized (они обрабатываются выше)
	if (result.error && result.error.status !== 401) {
		handleErrors(result.error);
	}

	return result;
};
