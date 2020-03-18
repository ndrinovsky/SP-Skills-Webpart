import { sp } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDeveloper } from "../interfaces/IDeveloper";
import { ISkill } from "../interfaces/ISkill";
import { ISkillSet } from "../interfaces/ISkillSet";
import { ISiteUserInfo } from "@pnp/sp/site-users/types";

export interface ISPLists {
    value: ISPList[];
}

export interface ISPList {
    Title: string;
    Id: string;
}

export interface SkillSetAPI{
    GUID: string;
    ID: number;
    Title: string;
}

export interface DeveloperAPI{
    ID: number;
    DeveloperId: number;
    Title: string;
    WorkHours: string;
    WorkPhone: string;
    AfterHoursPhone: string;
}

export interface DeveloperSkillAPI{
    ID: number;
    DeveloperId: number;
    SkillId: number;
    Title: string;
    Value: number;
}

export interface SkillAPI{
    GUID: string;
    ID: number;
    SkillSetId: number;
    Title: string;
}

export interface ISpService {
    getLists(): Promise<any[]>;
}

export class SpService {
    //   public static readonly serviceKey: ServiceKey<ISpService> = ServiceKey.create<ISpService>('SPFx:SpService', SpService);
    constructor(private context: WebPartContext) {
        sp.setup({
            spfxContext: this.context
        });
    }
    private async _getSkillSets(): Promise<ISkillSet[]> {
        let skillSets : ISkillSet[] = [];
        await sp.web.lists.getByTitle("SkillSet").items.get().then((items: SkillSetAPI[]) => {
            items.forEach((i) =>{
                skillSets.push({name : i.Title, skills: [], id : i.ID});
            })
        });
        await this._getSkills().then(skills => {
            skillSets.forEach(set => {
                let skillArray = skills.filter(x => x.SkillSetId === set.id);
                skillArray.forEach(x => {
                    set.skills.push({name : x.Title, value : -1, ID: -1});
                });
            });
        });
        return skillSets;
    }

    private async _getSkills(): Promise<SkillAPI[]> {
        let response : SkillAPI[] = [];
        await sp.web.lists.getByTitle("Skill").items.get().then((items: SkillAPI[]) => {
            response = items;
        });
        return response;
    }

    private async _getCurrentUser(): Promise<ISiteUserInfo> {
        let response = null
        await sp.web.currentUser.get().then((user) =>{
            response = user;
        });
        return response;
    }

    private async _getEmployeeSkills(id): Promise<ISkillSet[]> {
        let skills : ISkill[] = [];
        let subsets : ISkillSet[] = [];
        await this._getSkillSets().then(async result =>{
            subsets = result;
        });
        await sp.web.lists.getByTitle("EmployeeSkills").items.get().then((items: DeveloperSkillAPI[]) => {
            let empSkills = items.filter(x => x.DeveloperId === id);
            empSkills.forEach(i =>{
                skills.push({name : i.Title, value : i.Value, ID : i.ID});
            });
        });
        subsets.forEach(set =>{
            set.skills.forEach(skill => {
                let empSkill = skills.filter(x => x.name === skill.name)[0];
                if (empSkill != undefined){
                    skill.value = empSkill.value;
                    skill.ID = empSkill.ID;
                } else{
                    skill.value = 0;
                }
            });
        });
        return subsets;
    }
    private async _constructDeveloper(dev : DeveloperAPI): Promise<IDeveloper> {
        let developer : IDeveloper = null;
        await sp.web.getUserById(dev.DeveloperId).get().then(async user=>{
            developer = ({ID: dev.ID, developerId : dev.DeveloperId.toString(), fullname: user.Title, team : dev.Title, jobTitle:"", skills: [], workHours: dev.WorkHours, workPhone: dev.WorkPhone, afterHoursPhone : dev.AfterHoursPhone});
        });
        await this._getEmployeeSkills(dev.DeveloperId).then(skills => {
            developer.skills = skills;
        });
        return developer;
    }

    private async _asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      }

    private async _getEmployeeList(): Promise<DeveloperAPI[]> {
        let developers : DeveloperAPI[] = [];
        await sp.web.lists.getByTitle("Employee List").items.get().then((items: DeveloperAPI[]) => {
            developers = items;
        });
        return developers;
    }
    public async getDevelopers(): Promise<IDeveloper[]> {
        let developers : IDeveloper[] = [];
        await this._getEmployeeList().then(async result =>{
            await this._asyncForEach(result, async (dev) => {
                await this._constructDeveloper(dev).then(dev =>{ developers.push(dev)});
            });
        });

        return developers;
    }
    public async getSubsets(): Promise<ISkillSet[]> {
        let subsets : ISkillSet[] = [];
        await this._getSkillSets().then(result =>{
            subsets = result;
        });
        
        return subsets;
    }
    public async isCurrentUser(id): Promise<boolean> {
        let isCurrentUser : boolean = false;
        await this._getCurrentUser().then(result =>{
            isCurrentUser = result.UserId === id;
        });
        
        return isCurrentUser;
    }
    public async getCurrentUser(): Promise<ISiteUserInfo> {
        let currentUser : ISiteUserInfo = null;
        await this._getCurrentUser().then(result =>{
            currentUser = result;
        });
        
        return currentUser;
    }
    public async updateDeveloper(developer : IDeveloper): Promise<boolean> {
        let result = false;
        await this._updateDeveloper(developer).then(response =>{
            result = response;
        });
        developer.skills.forEach(set =>{
            this._asyncForEach(set.skills, async (skill) => {
                await this._updateSkill(skill).then(response =>{result = response;})})
        });
        return result;
    }
    private async _updateDeveloper(developer) : Promise<boolean>{
        let list = sp.web.lists.getByTitle("Employee List");

        await list.items.getById(developer.ID).update({
            AfterHoursPhone: developer.afterHoursPhone,
            WorkPhone: developer.workPhone,
            WorkHours: developer.workHours
        });
        return true;
    }

    private async _updateSkill(skill) : Promise<boolean>{
        let list = sp.web.lists.getByTitle("EmployeeSkills");
        await list.items.getById(skill.ID).update({
            Value: skill.value
        });
        return true;
    }
}