import { gql } from '@apollo/client';
import { getClient } from './client';
import { Report } from './report';

/**
 * Ability is an action taken by an actor in a report
 */
export interface Ability {
    /** The game ID of the ability */
    gameID: number
    /** Icon name used internally by FFLogs */
    icon: string
    /** Name of the ability */
    name: string
    /** Ability type, typically damage type */
    type: string
}

/**
 * The response given by a getAbilities query
 */
export interface GetAbilitiesResponse extends Report {
    abilities: Ability[]
}

/**
 * Gets ability info from a report
 * @param reportId The FFLogs report code (contained in the URL)
 */
export async function getAbilities(reportId: string): Promise<GetAbilitiesResponse> {
    const client = getClient();
    const result = await client.query({
        query: gql`
            query GetAbilities {
                reportData {
                    report(code: "${reportId}", allowUnlisted: true) {
                        code,
                        endTime,
                        masterData {
                            abilities {
                                gameID,
                                icon,
                                name,
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
        abilities: reportData.masterData.abilities,
        code: reportData.code,
        endTime: reportData.endTime,
        startTime: reportData.startTime,
        title: reportData.title,
        visibility: reportData.visibility
    };
}
