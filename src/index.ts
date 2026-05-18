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
import { getFights } from './fflogs/fight';
import { getActors } from './fflogs/actor';
import { EventDataType, getEvents, GetEventsParams } from './fflogs/event';
import { buildFilterString, FilterParams } from './util/gql';

(async () => {
	try {
		const fights = await getFights('t7GrpLcBXfRhN1P3');
		const fight = fights.fights[4];
		console.log('Querying fight...');
		console.log(util.inspect(fight, {showHidden: false, depth: null, colors: true}));

		const actors = await getActors('t7GrpLcBXfRhN1P3');
		const kali = actors.actors.find(e => e.name === 'Kali Liada' && fight.friendlyPlayers.includes(e.id));
		console.log('Querying actor...');
		console.log(util.inspect(kali, {showHidden: false, depth: null, colors: true}));

		const params: GetEventsParams = {
			dataType: EventDataType.DamageDone,
			fightIDs: [fight.id],
			sourceID: kali?.id
		};
		console.log('Using params...');
		console.log(buildFilterString(params as FilterParams, ['dataType']));
		
		const events = await getEvents('t7GrpLcBXfRhN1P3', params);
		console.log(util.inspect(events, {showHidden: false, depth: null, colors: true}));
	}
	catch(e) {
		console.error(`Unhandled error: ${e}`);
	}
})();
