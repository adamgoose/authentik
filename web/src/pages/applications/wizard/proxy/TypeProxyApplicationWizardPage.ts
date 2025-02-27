import { t } from "@lingui/macro";

import { customElement } from "@lit/reactive-element/decorators/custom-element.js";
import { TemplateResult, html } from "lit";

import {
    FlowDesignationEnum,
    FlowsApi,
    ProvidersApi,
    ProxyProviderRequest,
} from "@goauthentik/api";

import { DEFAULT_CONFIG } from "../../../../api/Config";
import { KeyUnknown } from "../../../../elements/forms/Form";
import "../../../../elements/forms/HorizontalFormElement";
import { WizardFormPage } from "../../../../elements/wizard/WizardFormPage";

@customElement("ak-application-wizard-type-proxy")
export class TypeProxyApplicationWizardPage extends WizardFormPage {
    sidebarLabel = () => t`Proxy details`;

    nextDataCallback = async (data: KeyUnknown): Promise<boolean> => {
        let name = this.host.state["name"] as string;
        // Check if a provider with the name already exists
        const providers = await new ProvidersApi(DEFAULT_CONFIG).providersAllList({
            search: name,
        });
        if (providers.results.filter((provider) => provider.name == name)) {
            name += "-1";
        }
        this.host.addActionBefore(t`Create provider`, async (): Promise<boolean> => {
            // Get all flows and default to the implicit authorization
            const flows = await new FlowsApi(DEFAULT_CONFIG).flowsInstancesList({
                designation: FlowDesignationEnum.Authorization,
                ordering: "slug",
            });
            const req: ProxyProviderRequest = {
                name: name,
                authorizationFlow: flows.results[0].pk,
                externalHost: data.externalHost as string,
            };
            const provider = await new ProvidersApi(DEFAULT_CONFIG).providersProxyCreate({
                proxyProviderRequest: req,
            });
            this.host.state["provider"] = provider;
            return true;
        });
        return true;
    };

    renderForm(): TemplateResult {
        return html`<form class="pf-c-form pf-m-horizontal">
            <ak-form-element-horizontal
                label=${t`External domain`}
                name="externalHost"
                ?required=${true}
            >
                <input type="text" value="" class="pf-c-form-control" required />
                <p class="pf-c-form__helper-text">
                    ${t`External domain you will be accessing the domain from.`}
                </p>
            </ak-form-element-horizontal>
        </form> `;
    }
}
