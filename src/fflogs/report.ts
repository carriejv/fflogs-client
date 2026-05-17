/**
 * Report contains top-level report data always returned when querying a report.
 */
export interface Report {
    /** ID of the report */
    code: string
    /** Unix epoch timestamp of the final event in the report */
    endTime: number
    /** Unix epoch timestamp of the first event in the report */
    startTime: number
    /** User-generated report title */
    title: string
    /** Visibility setting of the report */
    visibility: 'public' | 'private' | 'unlisted'
}
