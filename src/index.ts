/**
*  Copyright 2026 Carrie J V
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*  http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

import util from 'util';
import { FFLogsClientAuthenticator } from './auth/client-authenticator';
import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { FFLOGS_HOST, FFLOGS_PATH_API } from './constants/constants';
import { getFights } from './fflogs/fight';

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

const client = new ApolloClient({
	link: authLink.concat(new HttpLink({ uri: `https://${FFLOGS_HOST}${FFLOGS_PATH_API}`})),
	cache: new InMemoryCache()
});

(async () => {
	try {
		// const result = await client.query({
		// 	query: gql`
		// 		query GetReport {
		// 			reportData {
		// 				report(code: "qhmtKLzQ9P7nVH8G", allowUnlisted: true) {
		// 					endTime,
		// 					fights {
		// 						bossPercentage,
		// 						combatTime,
		// 						encounterID,
		// 						endTime,
		// 						fightPercentage,
		// 						gameZone {
		// 							name
		// 						},
		// 						id,
		// 						inProgress,
		// 						kill,
		// 						lastPhaseAsAbsoluteIndex,
		// 						name,
		// 						startTime,
		// 						wipeCalledTime
		// 					},
		// 					masterData {
		// 						abilities {
		// 							gameID,
		// 							icon,
		// 							name,
		// 							type
		// 						},
		// 						actors {
		// 							gameID,
		// 							icon,
		// 							id,
		// 							name,
		// 							petOwner,
		// 							server,
		// 							subType,
		// 							type
		// 						}
		// 					},
		// 					phases {
		// 						phases {
		// 							encouterID,
		// 							id,
		// 							name
		// 						}
		// 					},
		// 					startTime,
		// 					title
		// 				}
		// 			}
		// 		}`
		// });
		// if(result.error) {
		// 	console.error(`GQL error: ${result.error}`);
		// 	return;
		// }
		console.log(util.inspect(await getFights('qhmtKLzQ9P7nVH8G', true), {showHidden: false, depth: null, colors: true}));
	}
	catch(e) {
		console.error(`Unhandled error: ${e}`);
	}
})();
