import { gql } from '@apollo/client';
import { buildFilterString } from '../util/gql';
import { GetAbilitiesResponse } from './ability';
import { GetActorsParams, GetActorsResponse } from './actor';
import { getClient } from './client';

/**
 * The response given by a getMasterData query
 * Master data includes all actor and ability references
 * used in a report. This is equivalent to a `getActors`
 * and `getAbilities` in a single query.
 */
export type GetMasterDataResponse = GetActorsResponse & GetAbilitiesResponse;

/**
 * Gets masterData from a report
 * @param reportId The FFLogs report code (contained in the URL)
 * @param params Params object for the getActors query
 */
export async function getMasterData(reportId: string, params?: GetActorsParams): Promise<GetMasterDataResponse> {
    const client = getClient();
    const result = await client.query({
        query: gql`
            query GetFights {
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
                            },
                            actors${buildFilterString(params as {[key: string]: string})} {
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
        abilities: reportData.masterData.abilities,
        actors: reportData.masterData.actors,
        code: reportData.code,
        endTime: reportData.endTime,
        startTime: reportData.startTime,
        title: reportData.title,
        visibility: reportData.visibility
    };
}
