/**
 * FFLogsAuthenticator defines a class that can provide a valid FFLogs authentication token
 */
export interface FFLogsAuthenticator {
    /**
     * Fetches a token, authenticating if necessary
     * @returns A valid FFLogs Bearer token
     */
    token: () => string | Promise<string>
}

/**
 * FFLogsTokenResponse is the response from the FFLogs token endpoint
 */
export class FFLogsTokenResponse {
    // The access token
    public accessToken: string
    // Time in ms until token expiration. This is a relative timestamp from the request time
    public expiresIn: number
    // This is expected to be "Bearer" always
    public tokenType: string
    // Refresh token, returned only in cases of authentication as a user via authorization_code flow
    public refreshToken?: string

    /**
     * Parses and validates the token response from FFLogs, building an FFLogsTokenResponse object
     * @param rawResponse The raw response body
     */
    public constructor(rawResponse: string) {
        const jsonResponse = JSON.parse(rawResponse);
        this.accessToken = jsonResponse.access_token;
        if(!this.accessToken) {
            throw new Error('FFLogs did not return an access token');
        }
        this.expiresIn = jsonResponse.expires_in;
        if(!this.expiresIn) {
            throw new Error('FFLogs did not return a valid expiration time');
        }
        this.tokenType = jsonResponse.token_type;
        if(this.tokenType !== 'Bearer') {
            throw new Error(`FFLogs returned an unknown token type: ${this.tokenType}`);
        }
        this.refreshToken = jsonResponse.refresh_token;
    }
}
