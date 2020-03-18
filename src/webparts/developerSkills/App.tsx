import { Component } from 'react';
import * as React from 'react';
import { IAppProps } from "./IAppProps";
import DeveloperSkills  from './components/DeveloperSkills';
import { SpService } from './services/spservice';
import { ISiteUserInfo } from '@pnp/sp/site-users/types';

interface IAppState{    
    _isMounted : boolean;
    currentUser?: ISiteUserInfo;
}

export default class App extends Component<IAppProps, IAppState> {
    private spService: SpService = null;
    public constructor(props: Readonly<IAppProps>) {
        super(props);
        this.state = {
            _isMounted: false
        };
        this.spService = new SpService(this.context);
    }

    private async getCurrentUser(){
        await this.spService.getCurrentUser().then(result =>{
            this.setState({currentUser : result})
        });
    }

    public async componentDidMount() {
        await this.getCurrentUser().then(()=> {
            this.setState({_isMounted : true})
            }
        );
    }

    public render(){
        return(
            <>
                { this.state._isMounted &&
                    <DeveloperSkills
                        description={this.props.description}
                        currentUser={this.state.currentUser}
                    />
                }
            </>
        );
    }
}