export class Education {
    private readonly title: string
    private readonly fromDate: Date
    private readonly toDate: Date
    private description?: string

    constructor(title: string, fromDate: Date, toDate: Date, description?: string) {
        this.title = title
        this.fromDate = fromDate
        this.toDate = toDate
        this.description = description
    }

    getTitle(): string { return this.title }
    getFromDate(): Date { return this.fromDate }
    getToDate(): Date { return this.toDate }
    getDescription(): string | undefined { return this.description }
}