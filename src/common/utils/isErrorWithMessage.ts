/* Синтаксис error is { message: string } означает, что если функция возвращает true, TypeScript будет рассматривать
error как объект с обязательным строковым свойством message. */
export function isErrorWithMessage(error: unknown): error is { message: string } {
	return (
		typeof error === 'object' && // Проверяем, что error – это объект
		error != null && // Убеждаемся, что это не null
		'message' in error && // Проверяем, что у объекта есть свойство 'message'
		typeof (error as Record<string, unknown>).message === 'string' // Убеждаемся, что это строка
	);
}
