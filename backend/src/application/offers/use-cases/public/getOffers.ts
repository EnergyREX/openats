import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { OfferReturnType } from "../../types/OfferReturnType.js";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";
import { toError } from "src/domain/shared/helpers/ToError.ts";

export class GetOffers {
    constructor(
        private readonly jobPosting: IJobPostingRepository
    ) { }

    async exec(): Promise<Result<OfferReturnType[], GenericError>> {
        try {
            const res = await this.jobPosting.getAll()
            if (!res.ok) return Err(res.error)
            const data: OfferReturnType[] = res.value.map((m) => {
                const company = m.getCompany()
                const contactDetails = m.getContactDetails()
                const salary = m.getSalary()
                const location = m.getLocation()
                const requirements = m.getRequirements()
                return {
                    uuid: m.getUuid().toPrimitive(),
                    ownerUuid: m.getOwnerUuid().toPrimitive(),
                    title: m.getTitle(),
                    body: m.getBody(),
                    contactDetails: { 
                        address: contactDetails.getAddress() ?? "", 
                        email: contactDetails.getEmail() ?? "",
                        github: contactDetails.getGithub() ?? "",
                        linkedin: contactDetails.getLinkedin() ?? "",
                        phoneNumber: contactDetails.getPhoneNumber() ?? "",
                        website: contactDetails.getWebsite() ?? ""
                    },
                    company: {
                        industry: company.getIndustry() ?? "",
                        name: company.getName() ?? "",
                        size: company.getSize() ?? "",
                        website: company.getWebsite() ?? ""
                    },
                    salary: {
                        currency: salary.getCurrency() ?? "",
                        equity: salary.hasEquity() ?? "",
                        max: salary.getMaxSalary() ?? "",
                        min: salary.getMinSalary() ?? "",
                        period: salary.getPeriod() ?? ""
                    },
                    location: {
                        city: location.getCity() ?? "",
                        country: location.getCountry() ?? "",
                        modality: location.getModality() ?? ""
                    },
                    requirements: requirements,
                }
            })

            return Ok(data)
        } catch (err) {
            return Err(toError(err, "ERR_APPL_OFFER_GET"))
        }
    }
}