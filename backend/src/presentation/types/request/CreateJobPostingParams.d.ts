export type CreateJobPostingParams = {
    title: string,
    body: string,
    company: {
        name: string,
        size: string,
        website: string,
        industry: string
    },
    location: {
        city: string,
        country: string,
        modality: string
    },
    salary: {
        min: number,
        max: number,
        currency: string,
        period: string,
        equity: boolean
    },
    contactDetails?: {
        phoneNumber?: string,
        address?: string,
        email?: string,
        website?: string,
        github?: string,
        linkedin?: string
    },
    requirements?: string[]
}
