import { AndNext, DEFAULT_CONFIG } from "@goauthentik/web/api/Config";
import { EVENT_REFRESH } from "@goauthentik/web/constants";
import "@goauthentik/web/elements/Spinner";
import { MessageLevel } from "@goauthentik/web/elements/messages/Message";
import { showMessage } from "@goauthentik/web/elements/messages/MessageContainer";
import { BaseUserSettings } from "@goauthentik/web/user/user-settings/BaseUserSettings";

import { t } from "@lingui/macro";

import { TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { SourcesApi } from "@goauthentik/api";

@customElement("ak-user-settings-source-oauth")
export class SourceSettingsOAuth extends BaseUserSettings {
    @property()
    title!: string;

    @property({ type: Number })
    connectionPk = 0;

    render(): TemplateResult {
        if (this.connectionPk === -1) {
            return html`<ak-spinner></ak-spinner>`;
        }
        if (this.connectionPk > 0) {
            return html`<button
                class="pf-c-button pf-m-danger"
                @click=${() => {
                    return new SourcesApi(DEFAULT_CONFIG)
                        .sourcesUserConnectionsOauthDestroy({
                            id: this.connectionPk,
                        })
                        .then(() => {
                            showMessage({
                                level: MessageLevel.info,
                                message: t`Successfully disconnected source`,
                            });
                        })
                        .catch((exc) => {
                            showMessage({
                                level: MessageLevel.error,
                                message: t`Failed to disconnected source: ${exc}`,
                            });
                        })
                        .finally(() => {
                            this.parentElement?.dispatchEvent(
                                new CustomEvent(EVENT_REFRESH, {
                                    bubbles: true,
                                    composed: true,
                                }),
                            );
                        });
                }}
            >
                ${t`Disconnect`}
            </button>`;
        }
        return html`<a
            class="pf-c-button pf-m-primary"
            href="${ifDefined(this.configureUrl)}${AndNext(
                `/if/user/#/settings;${JSON.stringify({ page: "page-sources" })}`,
            )}"
        >
            ${t`Connect`}
        </a>`;
    }
}
