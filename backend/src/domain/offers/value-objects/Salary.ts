export class Salary {
    constructor(
        private readonly min: number,
        private readonly max: number,
        private readonly currency: string,
        private readonly period: string,
        private readonly equity: boolean
    ) {}

    static create(min: number, max: number, currency: string, period: string, equity: boolean) {
        return new Salary(min, max, currency, period, equity)
    }

    getMinSalary(): number { return this.min }
    getMaxSalary(): number { return this.max }
    getCurrency(): string { return this.currency }
    getPeriod(): string { return this.period }
    hasEquity(): boolean { return this.equity }
}