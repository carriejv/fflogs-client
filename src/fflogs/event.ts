import { gql } from '@apollo/client';
import { getClient } from './client';
import { Report } from './report';
import { buildFilterString, FilterParams } from '../util/gql';

const MAX_PAGE_SIZE = 10000;

/** Types of event data available */
export enum EventDataType {
    All = 'All',
    Buffs = 'Buffs',
    Casts = 'Casts',
    CombatantInfo = 'CombatantInfo',
    DamageDone = 'DamageDone',
    DamageTaken = 'DamageTaken',
    Deaths = 'Deaths',
    Debuffs = 'Debuffs',
    Dispels = 'Dispels',
    Healing = 'Healing',
    Interrupts = 'Interrupts',
    Resources = 'Resources',
    Summons = 'Summons',
    Threat = 'Threat'
}

/**
 * Params for a getEvents query
 */
export interface GetEventsParams {
    /** Gets events only involving a specific ability id */
    abilityID?: number
    /** Gets events of only a specific type */
    dataType?: EventDataType
    /** Gets events only for a specific environment */
    encounterID?: number
    /** Filters event list to only specific fight ID(s) */
    fightIDs?: number[]
    /** Comma-separated list of buffs / debuffs which must not be on the event source */
    sourceAurasAbsent?: string
    /** Comma-separated list of buffs / debuffs which must be on the event source */
    sourceAurasPresent?: string
    /** Class (actor subType) of the event source */
    sourceClass?: string
    /** Actor id of the event source */
    sourceID?: number
    /** If the source actor has multiple copies, specifies a given instance */
    sourceInstanceID?: number
    /** Comma-separated list of buffs / debuffs which must not be on the event target */
    targetAurasAbsent?: string
    /** Comma-separated list of buffs / debuffs which must be on the event target */
    targetAurasPresent?: string
    /** Class (actor subType) of the event target */
    targetClass?: string
    /** Actor id of the event target */
    targetID?: number
    /** If the target actor has multiple copies, specifies a given instance */
    targetInstanceID?: number
    /** If set, drops events after this number of deaths */
    wipeCutoff?: number
}

/**
 * The response given by a getEvents query
 * Event data does not have a stable API contract or type definition
 */
export interface GetEventsResponse extends Report {
    events: any[]
}

/**
 * Gets event info from a report
 * @param reportId The FFLogs report code (contained in the URL)
 */
export async function getEvents(reportId: string, params?: GetEventsParams): Promise<GetEventsResponse> {
    const client = getClient();
    let eventData: any[] = [];
    let startTime = 0;
    while(true) {
        const result = await client.query({
            query: gql`
                query GetEvents {
                    reportData {
                        report(code: "${reportId}", allowUnlisted: true) {
                            code,
                            endTime,
                            events${buildFilterString({limit: MAX_PAGE_SIZE, startTime: startTime, ...params} as FilterParams, ['dataType'])} {
                                data,
                                nextPageTimestamp
                            }
                            startTime,
                            title
                        }
                    }
                }`
        });
        if(result.error) {
            throw new Error (`GQL error: ${result.error}`);
        }
        const reportData = (result.data as any).reportData.report;
        console.log(reportData);
        eventData = eventData.concat(reportData.events.data);
        // Break if page is not full
        if(reportData.events.data.length < MAX_PAGE_SIZE) {
            return {
                code: reportData.code,
                events: eventData,
                endTime: reportData.endTime,
                startTime: reportData.startTime,
                title: reportData.title,
                visibility: reportData.visibility
            };
        }
        // Else, get next page starting from timestamp
        startTime = reportData.events.nextPageTimestamp;
    }
}
