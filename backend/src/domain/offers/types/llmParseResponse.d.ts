export type llmParseResponse = {
    name: string
    title: string
    contact: {
        email?: string
        phone?: string
        website?: string
        github?: string
        linkedin?: string
        location?: string
    }
    profile: string
    skills: string[]
    work_experience: {
        company: string
        location?: string
        role: string
        duration: string
        responsibilities: string[]
    }[]
    education: {
        title: string
        institution: string
        duration: string
        gpa?: string
    }[]
    certifications: {
        title: string
        institution: string
        duration: string
    }[]
    projects: {
        title: string
        description?: string
    }[]
    volunteering: string[]
    languages: {
        language: string
        level: string
    }[]
    additional_info: string[]
}
