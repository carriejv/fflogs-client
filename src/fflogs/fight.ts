import { gql } from '@apollo/client';
import { getClient } from './client';
import { Report } from './report';

/**
 * Fight defines a given boss encounter.
 */
export interface Fight {
    /** Unix epoch timestamp of the final event in the fight */
    absoluteEndTime: number
    /** Unix epoch timestamp of the first event in the fight */
    absoluteStartTime: number
    /** Literal %HP of the boss at encounter end */
    bossPercentage: number
    /** Total combat time in ms */
    combatTime: number
    /** Fight difficulty */
    difficulty: number
    /** FFLogs internal encounter id */
    encounterID: number
    /** End timestamp in ms relative to the start of the report */
    endTime: number
    /** Percent completion of the overall fight, including all phases */
    fightPercentage: number
    /** ID number of the fight */
    id: number
    /** True if a live log of a fight is not yet completed */
    inProgress: boolean
    /** True if the encounter was defeated */
    kill: boolean
    /** Final phase reached during the encounter; this is 0-indexed, unlike all other phase IDs */
    lastPhaseAsAbsoluteIndex: number
    /** Human-readable name of the encounter */
    name: string
    /** Phases that occur in the fight, if any */
    phases?: Phase[]
    /** Phase transitions that occurred during the fight, if any */
    phaseTransitions?: PhaseTransition[]
    /** Number of player participants */
    size: number
    /** True if the group used a standard composition */
    standardComposition: boolean
    /** Start timestamp in ms relative to the start of the report */
    startTime: number
    /** Timestamp of a called wipe in ms relative to the start of the report */
    wipeCalledTime: number
}

/**
 * Phase defines a phase of a given encounter.
 * If phases exist for fights in the given report, they will be returned.
 */
export interface Phase {
    /** Phase id number */
    id: number
    /** Name of the phase */
    name: string
    /** True if the phase is flagged as an intermission */
    isIntermission: boolean
}

/**
 * Phase transition defines the transition from one phase to another.
 */
export interface PhaseTransition {
    /** Phase id of the new phase */
    id: number
    /** Timestamp of the phase start in ms relative to the start of the report */
    startTime: number
}

/**
 * The response given by a getFights query
 */
export interface FightsResponse extends Report {
    fights: Fight[]
}

/**
 * Gets fight info from a report
 * @param reportId The FFLogs report code (contained in the URL)
 * @param filterTrash If set, filters fights with encounter ID = 0 (flagged as trash by FFLogs)
 */
export async function getFights(reportId: string, filterTrash?: boolean): Promise<FightsResponse> {
    const client = getClient();
    const result = await client.query({
        query: gql`
            query GetFights {
                reportData {
                    report(code: "${reportId}", allowUnlisted: true) {
                        code,
                        endTime,
                        fights {
                            bossPercentage,
                            combatTime,
                            difficulty,
                            encounterID,
                            endTime,
                            fightPercentage,
                            id,
                            inProgress,
                            kill,
                            lastPhaseAsAbsoluteIndex,
                            phaseTransitions {
                                id,
                                startTime
                            },
                            name,
                            size,
                            standardComposition,
                            startTime,
                            wipeCalledTime
                        },
                        phases {
                            encounterID,
                            phases {
                                id,
                                name,
                                isIntermission
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
    const response: FightsResponse = {
        code: reportData.code,
        fights: [],
        endTime: reportData.endTime,
        startTime: reportData.startTime,
        title: reportData.title,
        visibility: reportData.visibility
    };
    // Remap phases to be per-fight
    for(const fightData of reportData.fights) {
        if(filterTrash && fightData.encounterID === 0) {
            continue;
        }
        const mappedFight: Fight = {
            absoluteEndTime: fightData.endTime + response.endTime,
            absoluteStartTime: fightData.startTime + response.startTime,
            bossPercentage: fightData.bossPercentage,
            combatTime: fightData.combatTime,
            difficulty: fightData.difficulty,
            encounterID: fightData.encounterID,
            endTime: fightData.endTime,
            fightPercentage: fightData.fightPercentage,
            id: fightData.id,
            inProgress: fightData.inProgress,
            kill: fightData.kill,
            lastPhaseAsAbsoluteIndex: fightData.lastPhaseAsAbsoluteIndex,
            name: fightData.name,
            size: fightData.size,
            standardComposition: fightData.standardComposition,
            startTime: fightData.startTime,
            wipeCalledTime: fightData.wipeCalledTime
        }
        const phaseList = reportData.phases.find((e: any) => e.encounterID === fightData.encounterID);
        if(phaseList) {
            mappedFight.phases = phaseList;
            mappedFight.phaseTransitions = fightData.phaseTransitions;
        }
        response.fights.push(mappedFight);
    }
    return response;
}