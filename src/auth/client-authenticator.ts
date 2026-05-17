import https from 'https';
import { FFLOGS_HOST, FFLOGS_PATH_TOKEN } from '../constants/constants';
import { FFLogsAuthenticator, FFLogsTokenResponse } from './authenticator';

/**
 * FFLogsClientAuthenticator handles the fflogs authn/z process and caching of tokens
 */ 
export class FFLogsClientAuthenticator implements FFLogsAuthenticator {

    /**
     * The currently cached token
     */
    private cachedToken: string

    /**
     * Absolute Unix epoch timestamp of token expiration
     */
    private cacheExpires: number

    /**
     * Builds a new FFLogsClientAuthenticator
     * @param clientId The client ID
     * @param clientSecret The client secret
     * @param timeout The timeout for auth requests in ms, default 10000
     */
    public constructor(
        private clientId: string,
        private clientSecret: string,
        private timeout: number = 10000
    ) {
        this.cachedToken = '';
        this.cacheExpires = -1;
    }

    /** 
     * Token returns the currently active access_token
     */
    public async token(): Promise<string> {
        const time = Date.now();
        if(time > this.cacheExpires) {
            const authResponse = await this.authenticateClient();
            this.cachedToken = authResponse.accessToken;
            // This is a pemissitic estimate since FFLogs doesn't give us an exact issued timestamp.
            this.cacheExpires = time + authResponse.expiresIn;
        }
        return this.cachedToken;
    }

    /** 
     * Authenticates the client using the client_credentials grant.
     */
    public async authenticateClient(): Promise<FFLogsTokenResponse> {
        const postData = 'grant_type=client_credentials';
        return new Promise<FFLogsTokenResponse>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject('Timed out waiting for FFLogs token endpoint');
            }, this.timeout);
            const req = https.request({
                hostname: FFLOGS_HOST,
                path: FFLOGS_PATH_TOKEN,
                method: "POST",
                auth: `${this.clientId}:${this.clientSecret}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': postData.length
                },
            }, res => {
                let responseBuffer = '';
                res.on('data', d => {
                    responseBuffer += d;
                });
                res.on('end', () => {
                    clearTimeout(timeout);
                    if(res.statusCode !== 200) {
                        reject(`Non-200 status code from FFLogs token endpoint [${res.statusCode}: ${res.statusMessage}]: ${responseBuffer}`);
                    }
                    try {
                        resolve(new FFLogsTokenResponse(responseBuffer));
                    }
                    catch(e) {
                        reject(e);
                    }
                });
            });
            req.on('error', (e) => {
                reject(e);
            });
            req.write(postData);
            req.end();
        });
    }

}
