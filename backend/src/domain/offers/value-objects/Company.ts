export class Company {
    constructor(
        private readonly name: string,
        private readonly size?: string,
        private readonly website?: string,
        private readonly industry?: string,
    ) {}

    static create(name: string, size?: string, website?: string, industry?: string, ) {
        return new Company(name, size, website, industry)
    }

    getName(): string { return this.name }
    getSize(): string | undefined { return this.size }
    getWebsite(): string | undefined { return this.website }
    getIndustry(): string | undefined{ return this.industry }
}