import { Component } from 'react';
import * as React from 'react';
import { IAppProps } from "./IAppProps";
import DeveloperSkills  from './components/DeveloperSkills';

export default class App extends Component<IAppProps, {}> {
    public constructor(props: Readonly<IAppProps>) {
        super(props);
    }
    public render(){
        return(
            <DeveloperSkills
                description={this.props.description}
            />
        );
    }
}