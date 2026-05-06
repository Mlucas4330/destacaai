let _token: string | null = null
export const getToken = () => _token
export const setToken = (token: string | null) => { _token = token }
