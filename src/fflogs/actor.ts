import { gql } from '@apollo/client';
import { getClient } from './client';
import { Report } from './report';

/**
 * Actor is an entity that takes actions in a report,
 * which can be a player character or npc.
 */
export interface Actor {
    /** The game ID of the actor */
    gameID: number
    /** Icon name used internally by FFLogs */
    icon: string
    /** FFLogs id of the actor */
    id: number
    /** Name of the actor */
    name: string
    /** If set, this actor is a pet owned by the actor with the given id */
    petOwner?: number
    /** The server of a player character actor */
    server?: string
    /** The subtype of the actor. This is the class of a player character, or a descriptive type ie 'boss' for NPCs */
    subType: string
    /** Actor type, typically 'player' 'pet' or 'npc' */
    type: string
}

/**
 * Params for a getActors query
 */
export interface GetActorsParams {
    /** If set, filters to actors with the matching type */
    filterType?: string
    /** If set, filters to actors with the matching subtype */
    filterSubtype?: string
}

/**
 * The response given by a getActors query
 */
export interface GetActorsResponse extends Report {
    actors: Actor[]
}

/**
 * Gets actor info from a report
 * @param reportId The FFLogs report code (contained in the URL)
 * @param params Params object for the getActors query
 */
export async function getActors(reportId: string, params?: GetActorsParams): Promise<GetActorsResponse> {
    const client = getClient();
    // Build filter string for params
    let filters = [];
    if(params?.filterType) {
        filters.push(`type: ${params.filterType}`);
    }
    if(params?.filterSubtype) {
        filters.push(`subType: ${params.filterSubtype}`);
    }
    let filterStr = '';
    if(filters.length > 0) {
        filterStr = `(${filters.join(', ')})`
    }
    const result = await client.query({
        query: gql`
            query GetFights {
                reportData {
                    report(code: "${reportId}", allowUnlisted: true) {
                        code,
                        endTime,
                        masterData {
                            actors${filterStr} {
                                gameID,
                                icon,
                                id,
                                name,
                                petOwner,
                                server,
                                subType,
                                type
                            }
                        },
                        startTime,
                        title
                    }
                }
            }`
    });
    if(result.error) {
        throw new Error (`GQL error: ${result.error}`);
    }
    const reportData: any = (result.data as any).reportData.report;
    return {
        actors: reportData.masterData.actors,
        code: reportData.code,
        endTime: reportData.endTime,
        startTime: reportData.startTime,
        title: reportData.title,
        visibility: reportData.visibility
    };
}
