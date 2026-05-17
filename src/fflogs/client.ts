import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { FFLogsClientAuthenticator } from '../auth/client-authenticator';
import { FFLOGS_HOST, FFLOGS_PATH_API } from '../constants/constants';

let client: ApolloClient | undefined;

/**
 * Returns the currently active ApolloClient, or builds a new one if needed
 */
export function getClient(): ApolloClient {
    if(!client) {
        // TODO: Make less stupid
        const clientId = process.env['FFLOGS_ID'];
        if(!clientId) {
            throw new Error('FFLOGS_ID must be set');
        }
        const clientSecret = process.env['FFLOGS_SECRET'];
        if(!clientSecret) {
            throw new Error('FFLOGS_SECRET must be set');
        }
        const auth = new FFLogsClientAuthenticator(clientId, clientSecret);

        const authLink = new SetContextLink(async ({ headers }) => {
        const token = await auth.token();
        return {
            headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
            },
        };
        });

        client = new ApolloClient({
            link: authLink.concat(new HttpLink({ uri: `https://${FFLOGS_HOST}${FFLOGS_PATH_API}`})),
            cache: new InMemoryCache()
        });
    }
    return client
}
