import { CandidateFactory } from "src/domain/offers/factories/Candidate.factory.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { CandidateVolunteering } from "src/domain/offers/types/CandidateVolunteering.js";
import { CandidateAdditionalInfo } from "src/domain/offers/types/CandidateAdditionalInfo.js";
import { Err } from "src/domain/shared/types/Result.ts";

export interface CandidateEditableParams {
    name?: string
    title?: string
    about?: string
    skills?: string[]
    contactDetails?: {
        email?: string
        phoneNumber?: string
        address?: string
        website?: string
        github?: string
        linkedin?: string
    }
}

// Edita los campos "administrativos" del perfil (identidad, contacto, skills).
// El resto (experiencia, educación, proyectos...) se conserva tal cual, ya que
// hoy solo llegan estructurados desde el pipeline de parseo de CV.
export async function updateCandidate(
    uuid: string,
    params: CandidateEditableParams,
    repository: ICandidateRepository,
) {
    const rawData = await repository.getByUUID(uuid)
    if (!rawData.ok) return Err(rawData.error)

    const existing = rawData.value
    const contact = existing.getContactDetails()

    const updated = CandidateFactory.create(
        existing.getUuid(),
        params.name?.trim() || existing.getName(),
        params.title?.trim() || existing.getTitle(),
        params.about ?? existing.getAbout(),
        {
            email: params.contactDetails?.email ?? contact.getEmail() ?? undefined,
            phoneNumber: params.contactDetails?.phoneNumber ?? contact.getPhoneNumber() ?? undefined,
            address: params.contactDetails?.address ?? contact.getAddress() ?? undefined,
            website: params.contactDetails?.website ?? contact.getWebsite() ?? undefined,
            github: params.contactDetails?.github ?? contact.getGithub() ?? undefined,
            linkedin: params.contactDetails?.linkedin ?? contact.getLinkedin() ?? undefined,
        },
        params.skills ?? existing.getSkills(),
        existing.getCvPath(),
        existing.getExperience(),
        existing.getProjects(),
        existing.getEducation(),
        existing.getCertifications(),
        existing.getLanguages(),
        existing.getVolunteering() as CandidateVolunteering | undefined,
        existing.getAdditionalInfo() as CandidateAdditionalInfo | undefined,
    )

    return repository.update(updated)
}
