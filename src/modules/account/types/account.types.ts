export interface AccountUser {
    id: string
    username: string
    email: string
}

export interface Session {
    accessToken: string
    refreshToken: string
    userId: string
    username: string
}
