import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { setup as pnpSetup } from "@pnp/common";
import * as strings from 'DeveloperSkillsWebPartStrings';
// import DeveloperSkills  from './components/DeveloperSkills';
// import { IDeveloperSkillsProps } from './components/IDeveloperSkillsProps';
import App from './App';
import { IAppProps } from './IAppProps';

export interface IDeveloperSkillsWebPartProps {
    description: string;
}

export default class DeveloperSkillsWebPart extends BaseClientSideWebPart<IDeveloperSkillsWebPartProps> {
    public onInit(): Promise<void> {
        return super.onInit().then(_ => {
            pnpSetup({
                spfxContext: this.context
            });
        });
    }

    public render(): void {
        
        const element: React.ReactElement<IAppProps> = React.createElement(
            App,
            {
                description: this.properties.description
            }
        );
        ReactDom.render(element, this.domElement);
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                PropertyPaneTextField('description', {
                                    label: strings.DescriptionFieldLabel
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
