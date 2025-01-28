export interface LoginResponse {
  accessToken: string,
  expiresIn: number,
  username: string,
  authorities: string[],
}
