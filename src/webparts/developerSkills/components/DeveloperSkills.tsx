import * as React from 'react';
import { IDeveloperSkillsProps } from './IDeveloperSkillsProps';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ComposedChart, Label } from 'recharts';
import { Dropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { PrimaryButton, Facepile, FontSizes, IFacepilePersona, IconButton, ActionButton, Panel, Dialog, DialogFooter, DefaultButton, Spinner } from 'office-ui-fabric-react';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import Grid from '@material-ui/core/Grid';
import { withStyles, createStyles } from '@material-ui/core';
import { SpService } from '../services/spservice';
import { IDeveloperSkillsState } from './IDeveloperSkillsState';
import { IDeveloper } from '../interfaces/IDeveloper';
import { ISkillSet } from '../interfaces/ISkillSet';
import DeveloperPanel  from './DeveloperPanel';
interface IStats {
    name: string;
    skillRange: number[];
    average: number;
}

export class DeveloperSkills extends React.Component<IDeveloperSkillsProps, IDeveloperSkillsState> {
    private spService: SpService = null;

    public constructor(props: Readonly<IDeveloperSkillsProps>) {
        super(props);
        this.state = {
            slectedTeam: [],
            developers: [],
            skillSubsets: [],
            skillOptions: [],
            developerOptions: [],
            stats: [],
            _isMounted: false,
            isPanelOpen:false,
            _loading:false
        };
        this.spService = new SpService(this.context);
        this.openPanel = this.openPanel.bind(this);
        this.closePanel = this.closePanel.bind(this);
    }
    private closePanel(refresh : boolean){
        this.setState({ isPanelOpen: false });
        if(refresh){
            this.fetchData();
        }
    }    
    private openPanel = () =>{
        this.setState({ isPanelOpen: true });
    }
    private setDevelopers(developers) {
        this.setState({ developers });
    }

    private setDeveloper(selectedDeveloper) {
        this.setState({ selectedDeveloper });
    }

    private setSkillOptions(skillOptions) {
        this.setState({ skillOptions });
    }

    private setDeveloperOptions(developerOptions) {
        this.setState({ developerOptions });
    }

    private setSubsets(skillSubsets) {
        this.setState({ skillSubsets });
        //this.setSubset(skillSubsets[0]);
    }

    private setSubset(selectedSubset) {
        this.setState({ selectedSubset });
    }

    private setTeam(slectedTeam) {
        this.setState({ slectedTeam });
    }

    private setStats(stats) {
        this.setState({ stats });
    }

    private selectDeveloper = (ev?: React.MouseEvent<HTMLElement>, persona?: IFacepilePersona) => {
        this.setDeveloper(this.state.developers.filter(x => x.fullname === persona.personaName)[0]);
    }

    private handleDevChange = (event: React.ChangeEvent<HTMLInputElement>, option?: IDropdownOption, index?: number) => {
        let developer: IDeveloper = this.state.developers.filter(x => x.developerId === option.key)[0];
        this.setDeveloper(developer);
    }

    private handleSkillChange = (event: React.ChangeEvent<HTMLInputElement>, option?: IDropdownOption, index?: number) => {
        let skillSubset: ISkillSet = this.state.skillSubsets.filter(x => x.name === option.text)[0];
        this.setSubset(skillSubset);
    }
    private updateStats() {
        let stats = [];
        if (this.state.selectedDeveloper !== undefined && this.state.selectedSubset !== undefined) {
            let slecetedSkills = this.state.selectedDeveloper.skills.filter(x => x.name === this.state.selectedSubset.name)[0];
            slecetedSkills.skills.map((skill) => {
                stats.push({ subject: skill.name, value: skill.value, fullMark: 10 });
            });
        }
        this.setStats(stats);
    }
    private removeDev = () => {
        let developers = this.state.slectedTeam;
        developers.splice(developers.indexOf(this.state.selectedDeveloper), 1);
        this.setTeam(developers);
    }

    private addDev = () => {
        let developers = this.state.slectedTeam;
        developers.push(this.state.selectedDeveloper);
        this.setTeam(developers);
    }

    private async getDevelopers(): Promise<IDeveloper[]> {
        let developers: IDeveloper[] = [];
        await this.spService.getDevelopers().then(result => {
            result.sort((a, b) => {
                var nameA = a.team.toUpperCase();
                var nameB = b.team.toUpperCase();
                if (nameA < nameB) { return -1; }
                if (nameA > nameB) { return 1; }
                return 0;
            });
            developers = result;
        });
        return developers;
    }
    private async getSubsets() {
        await this.spService.getSubsets().then(result => {
            this.setSubsets(result);
            const skilloptions: IDropdownOption[] = [];
            result.map((value, index) => {
                skilloptions.push({ key: index, text: value.name });
            });
            this.setSkillOptions(skilloptions);
        });
    }

    private renderTeamStats(subset: ISkillSet): React.ReactElement<IDeveloperSkillsProps> {
        const { classes } = this.props;
        const combinedStats: IStats[] = [];
        subset.skills.map((skill) => {
            combinedStats.push({ name: skill.name, average: 0, skillRange: [-1, -1] });
        });
        this.state.slectedTeam.map((dev) => {
            let skillset = dev.skills.filter(x => x.name === subset.name);
            skillset[0].skills.map((skill) => {
                let stat = combinedStats.filter(x => x.name === skill.name)[0];
                if (stat.skillRange[0] > skill.value || stat.skillRange[0] === -1) {
                    stat.skillRange[0] = skill.value;
                }
                if (stat.skillRange[1] < skill.value || stat.skillRange[1] === -1) {
                    stat.skillRange[1] = skill.value;
                }
                stat.average = Number((stat.average + skill.value / this.state.slectedTeam.length).toPrecision(2));
            });
        });
        return (<Grid item xs={12}>
            <div style={{ fontSize: FontSizes.large }} className={classes.center}>
                {subset.name}
            </div>
            <ComposedChart width={730} height={250} data={combinedStats}
                margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                }}>
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
                <YAxis type="number" domain={[0, 10]} interval={0} ticks={[0, 2, 4, 6, 8, 10]} />
                <Tooltip />
                <Legend />
                <Bar name="Skill Range" dataKey="skillRange" barSize={40} fill="#8884d8" />
                <Line name="Average" type="monotone" dataKey="average" stroke="#ff7300" />
            </ComposedChart>
        </Grid>);
    }
    private async fetchData(){
        this.setState({_loading : true});
        await this.getDevelopers().then((developers) => {
            const options: IDropdownOption[] = [];
            this.setDevelopers(developers);
            developers.map((value, index) => {
                if (!options.some(x => x.key === value.team + "Header")) {
                    options.push({ key: 'divider_' + index, text: '-', itemType: DropdownMenuItemType.Divider });
                    options.push({ key: value.team + "Header", text: value.team, itemType: DropdownMenuItemType.Header });
                }
                // options.push({ key: value.id, text: value.surname + ", " + value.givenName });
                options.push({ key: value.developerId, text: value.fullname });
            });
            this.setDeveloperOptions(options);
            this.getSubsets();
            this.updateStats();
        })
        this.setState({_loading : false});
    }
    public async componentDidMount() {
        await this.fetchData().then(() =>
            this.setState({ _isMounted: true })
        );
    }
    public componentDidUpdate(prevProps, prevState, ) {
        if (this.state.selectedDeveloper !== prevState.selectedDeveloper || this.state.selectedSubset !== prevState.selectedSubset) {
            this.updateStats();
        }
    }
    public render(): React.ReactElement<IDeveloperSkillsProps> {
        const { classes } = this.props;
        const team: IFacepilePersona[] = [];
        this.state.slectedTeam.map((dev) => {
            //team.push({ personaName: dev.givenName + " " + dev.surname, onClick: this.selectDeveloper });
            team.push({ personaName: dev.fullname, onClick: this.selectDeveloper });
        });
        return (
            <React.Fragment>
                {this.state._isMounted && <>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Dropdown name="selectedDeveloper" placeholder="Select an option" label="Select Developer" options={this.state.developerOptions} onChange={this.handleDevChange} selectedKey={this.state.selectedDeveloper !== undefined ? this.state.selectedDeveloper.developerId : undefined} />
                        </Grid>
                        <Grid item xs={6}>
                            <Dropdown name="selectedSubset" placeholder="Select an option" label="Select Skill Subset" options={this.state.skillOptions} onChange={this.handleSkillChange} />
                        </Grid>
                        {this.state.selectedDeveloper !== undefined ?
                            <>
                            {!this.state._loading ? 
                            <>
                                <Grid item xs={6}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} className={classes.center}>
                                            <Persona
                                                text={this.state.selectedDeveloper.fullname}
                                                // text={this.state.selectedDeveloper.givenName + " " + this.state.selectedDeveloper.surname}
                                                secondaryText={"Work: " + this.state.selectedDeveloper.workPhone}
                                                size={PersonaSize.size100}
                                                imageAlt={this.state.selectedDeveloper.fullname}
                                                // imageAlt={this.state.selectedDeveloper.surname + ", " + this.state.selectedDeveloper.givenName}
                                                tertiaryText={"After Hours: " + this.state.selectedDeveloper.afterHoursPhone}
                                                optionalText={this.state.selectedDeveloper.workHours}
                                            />
                                            {this.props.currentUser.Id.toString() === this.state.selectedDeveloper.developerId &&
                                                <ActionButton iconProps={{ iconName: 'PlayerSettings' }} onClick={this.openPanel}>
                                                    Modify Information
                                            </ActionButton>
                                            }
                                        </Grid>
                                        <Grid item xs={12} className={classes.center}>
                                            <PrimaryButton iconProps={{ iconName: 'Remove' }} text="Remove" onClick={this.removeDev} disabled={!this.state.slectedTeam.some(x => x.developerId === this.state.selectedDeveloper.developerId)} />
                                            <PrimaryButton iconProps={{ iconName: 'Add' }} text="Add" onClick={this.addDev} disabled={this.state.slectedTeam.some(x => x.developerId === this.state.selectedDeveloper.developerId)} />
                                        </Grid>
                                        <Grid item xs={12} className={classes.center}>
                                            <div style={{ fontSize: FontSizes.medium }}>
                                                Selected Team:
                                        </div>
                                            <Facepile
                                                personaSize={PersonaSize.size40}
                                                personas={team}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={6}>
                                    {this.state.selectedSubset !== undefined && this.state.stats !== [] ?
                                        <RadarChart cx={"50%"} cy={"50%"} width={400} height={300} data={this.state.stats}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <PolarRadiusAxis angle={60} domain={[0, 10]} />
                                            <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        </RadarChart> :
                                        <div style={{ fontSize: FontSizes.medium }}>
                                            No Skill Subset Selected.
                                </div>}
                                </Grid>
                                </> :      
                                    <div>
                                        <Label>Spinner with label positioned below</Label>
                                        <Spinner label="Loading..." />
                                    </div>}

                            </> :
                            <Grid item xs={12}>
                                <div style={{ fontSize: FontSizes.medium }} className={classes.center}>
                                    No Developer Selected.
                            </div>
                            </Grid>
                        }
                        <Grid item xs={12}>
                            <div style={{ fontSize: FontSizes.xLarge }} className={classes.center}>
                                Team Stats
                        </div>
                        </Grid>
                        {this.state.slectedTeam.length > 0 ?
                            this.state.skillSubsets.map((subset, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        {this.renderTeamStats(subset)}
                                    </React.Fragment>);
                            }) :
                            <Grid item xs={12}>
                                <div style={{ fontSize: FontSizes.medium }} className={classes.center}>
                                    Add members to your team to generate stats.
                                </div>
                            </Grid>
                        }
                    </Grid> 
                    {this.state.selectedDeveloper !== undefined && <DeveloperPanel isPanelOpen={this.state.isPanelOpen} closePanel={this.closePanel} developer={this.state.selectedDeveloper}/>}
                </>}
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

export default withStyles(styles)(DeveloperSkills);