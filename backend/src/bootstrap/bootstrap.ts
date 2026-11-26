import { authContainer } from "./containers/auth.container.ts";
import { offerContainer } from "./containers/offers.container.ts";
import { dashboardContainer } from "./containers/dashboard.container.ts";
import { candidacyContainer } from "./containers/candidacies.container.ts";
import { settingsContainer } from "./containers/settings.container.ts";

const container = {
    auth: authContainer,
    offer: offerContainer,
    dashboard: dashboardContainer,
    candidacy: candidacyContainer,
    settings: settingsContainer
}

export default container