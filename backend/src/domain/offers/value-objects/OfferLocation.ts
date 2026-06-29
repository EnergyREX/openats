export class OfferLocation {
    constructor(
        private readonly city: string,
        private readonly country: string,
        private readonly modality: string,
    ) {}

    static create(city: string, country: string, modality: string) {
        return new OfferLocation(city, country, modality)
    }

    getCity(): string { return this.city }
    getCountry(): string { return this.country }
    getModality(): string { return this.modality }
}