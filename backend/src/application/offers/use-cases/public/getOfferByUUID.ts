import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { OfferReturnType } from "../../types/OfferReturnType.js";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";
import { toError } from "src/domain/shared/helpers/ToError.ts";

export class GetOfferByUUID {
    constructor(
        private readonly jobPosting: IJobPostingRepository
    ) { }

    async exec(uuid: string): Promise<Result<OfferReturnType, GenericError>> {
        try {
            const res = await this.jobPosting.getByUUID(uuid)
            if (!res.ok) return Err(res.error)
            const contactDetails = res.value.getContactDetails()
            const company = res.value.getCompany()
            const salary = res.value.getSalary()
            const location = res.value.getLocation()
            const requirements = res.value.getRequirements()
            const data: OfferReturnType = {
                    uuid: res.value.getUuid().toPrimitive(),
                    ownerUuid: res.value.getOwnerUuid().toPrimitive(),
                    title: res.value.getTitle(),
                    body: res.value.getBody(),
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
                        currency: salary.getCurrency(),
                        equity: salary.hasEquity(),
                        max: salary.getMaxSalary(),
                        min: salary.getMinSalary(),
                        period: salary.getPeriod()
                    },
                    location: {
                        city: location.getCity(),
                        country: location.getCountry(),
                        modality: location.getModality()
                    },
                    requirements: requirements,
                }
            

            return Ok(data)
        } catch (err) {
            return Err(toError(err, "ERR_APPL_OFFER_GET"))
        }
    }
}