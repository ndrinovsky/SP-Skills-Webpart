import { IDeveloper } from "../interfaces/IDeveloper";
import { ISkillSet } from "../interfaces/ISkillSet";
import { IDropdownOption } from "office-ui-fabric-react";

export interface IDeveloperSkillsState {
    developers: IDeveloper[];
    skillSubsets: ISkillSet[];
    slectedTeam: IDeveloper[];
    selectedDeveloper?: IDeveloper;
    selectedSubset?: ISkillSet;
    skillOptions: IDropdownOption[];
    developerOptions: IDropdownOption[];
    stats: any[];
    _isMounted : boolean;
    isPanelOpen: boolean;
    _loading: boolean;
}
