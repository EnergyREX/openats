import { authContainer } from "./containers/auth.container.ts";
import { offerContainer } from "./containers/offers.container.ts";

const container = {
    auth: authContainer,
    offer: offerContainer
}

export default container