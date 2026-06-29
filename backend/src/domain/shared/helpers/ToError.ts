export interface RepositoryError<TCode extends string = string> {
    message: string
    code: TCode
}

/**
 * Normalizes an unknown catch value into a typed error.
 * Use this in every catch block instead of repeating
 * the instanceof Error check manually.
 *
 * @example
 * } catch (err) {
 *     return Err(toError(err, 'ERR_USER_CREATE'))
 * }
 */
export function toError<TCode extends string>(
    err: unknown,
    code: TCode
): RepositoryError<TCode> {
    return {
        code,
        message: err instanceof Error ? err.message : 'Unknown error',
    }
}
