import { DEFAULT_CONFIG } from "@goauthentik/web/api/Config";
import "@goauthentik/web/elements/forms/ProxyForm";
import "@goauthentik/web/elements/wizard/FormWizardPage";
import "@goauthentik/web/elements/wizard/Wizard";
import { WizardPage } from "@goauthentik/web/elements/wizard/WizardPage";
import "@goauthentik/web/pages/sources/ldap/LDAPSourceForm";
import "@goauthentik/web/pages/sources/oauth/OAuthSourceForm";
import "@goauthentik/web/pages/sources/plex/PlexSourceForm";
import "@goauthentik/web/pages/sources/saml/SAMLSourceForm";

import { t } from "@lingui/macro";

import { customElement } from "@lit/reactive-element/decorators/custom-element.js";
import { CSSResult, LitElement, TemplateResult, html } from "lit";
import { property } from "lit/decorators.js";

import AKGlobal from "@goauthentik/web/authentik.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFRadio from "@patternfly/patternfly/components/Radio/radio.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

import { SourcesApi, TypeCreate } from "@goauthentik/api";

@customElement("ak-source-wizard-initial")
export class InitialSourceWizardPage extends WizardPage {
    @property({ attribute: false })
    sourceTypes: TypeCreate[] = [];

    static get styles(): CSSResult[] {
        return [PFBase, PFForm, PFButton, AKGlobal, PFRadio];
    }
    sidebarLabel = () => t`Select type`;

    render(): TemplateResult {
        return html`<form class="pf-c-form pf-m-horizontal">
            ${this.sourceTypes.map((type) => {
                return html`<div class="pf-c-radio">
                    <input
                        class="pf-c-radio__input"
                        type="radio"
                        name="type"
                        id=${`${type.component}-${type.modelName}`}
                        @change=${() => {
                            this.host.steps = [
                                "initial",
                                `type-${type.component}-${type.modelName}`,
                            ];
                            this.host.isValid = true;
                        }}
                    />
                    <label class="pf-c-radio__label" for=${`${type.component}-${type.modelName}`}
                        >${type.name}</label
                    >
                    <span class="pf-c-radio__description">${type.description}</span>
                </div>`;
            })}
        </form>`;
    }
}

@customElement("ak-source-wizard")
export class SourceWizard extends LitElement {
    static get styles(): CSSResult[] {
        return [PFBase, PFButton, AKGlobal, PFRadio];
    }

    @property({ attribute: false })
    sourceTypes: TypeCreate[] = [];

    firstUpdated(): void {
        new SourcesApi(DEFAULT_CONFIG).sourcesAllTypesList().then((types) => {
            this.sourceTypes = types;
        });
    }

    render(): TemplateResult {
        return html`
            <ak-wizard
                .steps=${["initial"]}
                header=${t`New source`}
                description=${t`Create a new source.`}
            >
                <ak-source-wizard-initial slot="initial" .sourceTypes=${this.sourceTypes}>
                </ak-source-wizard-initial>
                ${this.sourceTypes.map((type) => {
                    return html`
                        <ak-wizard-page-form
                            slot=${`type-${type.component}-${type.modelName}`}
                            .sidebarLabel=${() => t`Create ${type.name}`}
                        >
                            <ak-proxy-form
                                .args=${{
                                    modelName: type.modelName,
                                }}
                                type=${type.component}
                            ></ak-proxy-form>
                        </ak-wizard-page-form>
                    `;
                })}
                <button slot="trigger" class="pf-c-button pf-m-primary">${t`Create`}</button>
            </ak-wizard>
        `;
    }
}
