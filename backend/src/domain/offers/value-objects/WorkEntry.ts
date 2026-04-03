export class WorkEntry {
    private readonly title: string
    private readonly fromDate?: Date
    private readonly toDate?: Date
    private description?: string
    private additionalFields?: Record<string, string>

    constructor(title: string, fromDate: Date, toDate: Date, description?: string, additionalFields?: Record<string, string>) {
        this.title = title
        this.fromDate = fromDate
        this.toDate = toDate
        this.description = description
        this.additionalFields = additionalFields
    }

    getTitle(): string { return this.title }
    getFromDate(): Date | undefined { return this.fromDate }
    getToDate(): Date | undefined { return this.toDate }
    getDescription(): string | undefined { return this.description }
    getAdditionalData(): Record<string, string> | undefined { return this.additionalFields }
}