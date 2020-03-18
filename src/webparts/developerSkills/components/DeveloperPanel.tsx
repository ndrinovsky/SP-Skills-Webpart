import * as React from 'react';
import { PrimaryButton, Panel, Dialog, DialogFooter, DefaultButton, DialogType, Persona, PersonaSize, Slider, FontSizes, VerticalDivider, MaskedTextField } from 'office-ui-fabric-react';
import { withStyles, createStyles } from '@material-ui/core';
import { SpService } from '../services/spservice';
import { IDeveloper } from '../interfaces/IDeveloper';
import { ISkillSet } from '../interfaces/ISkillSet';

interface IDeveloperPanelProps {
    classes:any;
    isPanelOpen: boolean;
    closePanel: any;
    developer: IDeveloper;
}
interface IDeveloperPanelState {
    isDialogOpen: boolean;
    workPhone:string;
    afterHoursPhone: string;
    workHours: string;
    skills: ISkillSet[];
}

export class DeveloperPanel extends React.Component<IDeveloperPanelProps, IDeveloperPanelState> {
    private spService: SpService = null;
    public constructor(props: Readonly<IDeveloperPanelProps>) {
        super(props);
        this.state = {
            isDialogOpen: false,
            workPhone: "",
            afterHoursPhone: "",
            workHours: "",
            skills: []
        };
        this.dismissPanel = this.dismissPanel.bind(this);
        this.hideDialogAndPanel = this.hideDialogAndPanel.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
        this.showDialog = this.showDialog.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.spService = new SpService(this.context);
    }
    private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newState = { [event.target.name]: event.target.value } as any;
        this.setState(newState);
    };
    private handleSliderChange = (set: string, field: string, value: number) => {
        let skills = this.state.skills;
        skills.filter(x => x.name === set)[0].skills.filter(x => x.name === field)[0].value = value;
        this.setState({skills});
    };
    private setFields(){
        this.setState({workPhone: this.props.developer.workPhone, workHours: this.props.developer.workHours, afterHoursPhone: this.props.developer.afterHoursPhone, skills: this.props.developer.skills});
    }
    private showDialog(){
        this.setState({isDialogOpen: true});
    }
    private dismissPanel(){
        this.showDialog();
    }
    private hideDialog(){
        this.setState({isDialogOpen: false});
    }
    private hideDialogAndPanel(){
        this.setState({isDialogOpen: false});
        this.props.closePanel(false);
    }
    private saveChanges(){
        this.spService.updateDeveloper(({ID: this.props.developer.ID, developerId: this.props.developer.developerId, jobTitle: this.props.developer.jobTitle, 
                                        fullname : this.props.developer.fullname,team: this.props.developer.team, workPhone : this.state.workPhone, 
                                        afterHoursPhone : this.state.afterHoursPhone, workHours : this.state.workHours, skills  : this.state.skills}))
        this.props.closePanel(true);
    }
    public componentDidMount(){
        this.setFields();
    }

    public render(): React.ReactElement<IDeveloperPanelProps> {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <Panel
                    isOpen={this.props.isPanelOpen}
                    isLightDismiss={true}
                    onLightDismissClick={this.showDialog}
                    onDismiss={this.dismissPanel}
                    headerText="Edit Information"
                    closeButtonAriaLabel="Close"
                    isFooterAtBottom={true}
                >
                    <>
                        <Persona
                            text={this.props.developer.fullname}
                            size={PersonaSize.size40}
                            imageAlt={this.props.developer.fullname}
                        />                        
                        <MaskedTextField name="workPhone" label="Work Phone" mask="(999) 999 - 9999" value={this.state.workPhone} onChange={this.handleChange}/>        
                        <MaskedTextField name="afterHoursPhone" label="After Hours Phone" mask="(999) 999 - 9999" value={this.state.afterHoursPhone} onChange={this.handleChange}/>        
                        <MaskedTextField name="workHours" label="Work Hours" mask="9:99 A.M. - 9:99 P.M." value={this.state.workHours} onChange={this.handleChange}/>
                        {
                            this.state.skills.map((set, index) => {
                                return(<React.Fragment key={index}>                                                                
                                    <div style={{ fontSize: FontSizes.medium }} className={classes.center}>
                                        {set.name + " Skills"}
                                    </div>
                                    {set.skills.map((skill, index) => {
                                        return(
                                            <Slider
                                                key={index}
                                                name={skill.name}
                                                label={skill.name}
                                                max={10}
                                                value={skill.value}
                                                onChange={(value: number) => this.handleSliderChange(set.name, skill.name, value)}
                                                showValue={true}
                                            />
                                        )
                                    })}
                                </React.Fragment>)
                            })
                        }
                        <div>
                        <PrimaryButton onClick={this.saveChanges}>Save</PrimaryButton>
                        <DefaultButton onClick={this.dismissPanel}>Cancel</DefaultButton>
                        </div>
                    </>
                </Panel>
                <Dialog hidden={!this.state.isDialogOpen} 
                onDismiss={this.hideDialog} 
                dialogContentProps={{
                    type: DialogType.normal,
                    title: 'Are you sure you want to close the panel? All unsaved changes will be lost.'
                }}
                modalProps={{
                    isBlocking: true,
                    styles: { main: { maxWidth: 450 } }
                }}>
                    <DialogFooter>
                        <PrimaryButton onClick={this.hideDialogAndPanel} text="Yes" />
                        <DefaultButton onClick={this.hideDialog} text="No" />
                    </DialogFooter>
                </Dialog>
            </React.Fragment>
        );
    }
}

const styles = createStyles(() => ({
    center: {
        margin: '0 auto',
        textAlign: 'center'
    },
}));

export default withStyles(styles)(DeveloperPanel);