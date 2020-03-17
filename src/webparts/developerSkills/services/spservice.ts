import { ServiceKey, ServiceScope } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { AadTokenProviderFactory } from "@microsoft/sp-http";
import { sp } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import MockHttpClient from '../MockHttpClient';
import { ISiteUser } from "@pnp/sp/site-users/types";
import { IDeveloper } from "../interfaces/IDeveloper";
import { ISkill } from "../interfaces/ISkill";
import { ISkillSet } from "../interfaces/ISkillSet";

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
    GUID: string;
    DeveloperId: number;
    Title: string;
}

export interface DeveloperSkillAPI{
    GUID: string;
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
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}
//Mock Data
// const skills : ISkill[] = [{name: "JS", value: getRandomInt(10)}, {name: "HTML", value: getRandomInt(10)}, {name: "CSS", value: getRandomInt(10)}, {name: "React", value: getRandomInt(10)}, {name: "Razor", value: getRandomInt(10)}];
// const skills1 : ISkill[] = [{name: "JS", value: getRandomInt(10)}, {name: "HTML", value: getRandomInt(10)}, {name: "CSS", value: getRandomInt(10)}, {name: "React", value: getRandomInt(10)}, {name: "Razor", value: getRandomInt(10)}];
// const skills2 : ISkill[] = [{name: "JS", value: getRandomInt(10)}, {name: "HTML", value: getRandomInt(10)}, {name: "CSS", value: getRandomInt(10)}, {name: "React", value: getRandomInt(10)}, {name: "Razor", value: getRandomInt(10)}];
// const skills3 : ISkill[] = [{name: "C#", value: getRandomInt(10)}, {name: "MVC", value: getRandomInt(10)}, {name: "Python", value: getRandomInt(10)}, {name: "Entity", value: getRandomInt(10)}, {name: ".Net", value: getRandomInt(10)}];
// const skills4 : ISkill[] = [{name: "C#", value: getRandomInt(10)}, {name: "MVC", value: getRandomInt(10)}, {name: "Python", value: getRandomInt(10)}, {name: "Entity", value: getRandomInt(10)}, {name: ".Net", value: getRandomInt(10)}];
// const skills5 : ISkill[] = [{name: "C#", value: getRandomInt(10)}, {name: "MVC", value: getRandomInt(10)}, {name: "Python", value: getRandomInt(10)}, {name: "Entity", value: getRandomInt(10)}, {name: ".Net", value: getRandomInt(10)}];
// const skillSet : ISkillSet[] = [{name: "Front End", skills: skills}, {name: "Back End", skills: skills3}];
// const skillSet1 : ISkillSet[] = [{name: "Front End", skills: skills1}, {name: "Back End", skills: skills4}];
// const skillSet2 : ISkillSet[] = [{name: "Front End", skills: skills2}, {name: "Back End", skills: skills5}];
// const dev : IDeveloper = {id: "0", givenName : "Nicholas", surname : "Drinovsky",  jobTitle: "Software Programmer Analyst I", team: "Web Team", skills : skillSet};
// const dev1 : IDeveloper = {id: "1", givenName : "Jay", surname : "Arellano",  jobTitle: "Software Programmer Analyst I", team: "Web Team", skills : skillSet1};
// const dev2 : IDeveloper = {id: "2", givenName : "Eddie", surname : "Urena",  jobTitle: "Software Programmer Analyst I", team: "Web Team", skills : skillSet2};
// const list : IDeveloper[] = [dev, dev1, dev2];

export class SpService {
    //   public static readonly serviceKey: ServiceKey<ISpService> = ServiceKey.create<ISpService>('SPFx:SpService', SpService);
    constructor(private context: WebPartContext) {
        sp.setup({
            spfxContext: this.context
        });
    }

    private _getMockListData(): Promise<ISPLists> {
        return MockHttpClient.get()
            .then((data: ISPList[]) => {
                var listData: ISPLists = { value: data };
                return listData;
            }) as Promise<ISPLists>;
    }


    private async _getSkillSets(): Promise<ISkillSet[]> {
        let skillSets : ISkillSet[] = [];
        await sp.web.lists.getByTitle("SkillSet").items.get().then((items: SkillSetAPI[]) => {
            items.forEach((i) =>{
                skillSets.push({name : i.Title, skills: []});
            })
        });
        await this._getSkills().then(skills => {
            skillSets.forEach(set => {
                let skillArray = skills.filter(x => x.Title === set.name);
                skillArray.forEach(x => {
                    set.skills.push({name : x.Title, value : -1});
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

    private async _getEmployeeSkills(id): Promise<ISkillSet[]> {
        let empSkillSet : ISkillSet[] = [];
        let skills : ISkill[] = [];
        await sp.web.lists.getByTitle("EmployeeSkills").items.get().then((items: DeveloperSkillAPI[]) => {
            let empSkills = items.filter(x => x.DeveloperId = id)
            empSkills.forEach(i =>{
                skills.push({name : i.Title, value : i.Value});
            });
        });

        return empSkillSet;
    }
    private async _constructDeveloper(dev : DeveloperAPI): Promise<IDeveloper> {
        let developer : IDeveloper = null;
        await sp.web.getUserById(dev.DeveloperId).get().then(async user=>{
            developer = ({id : dev.DeveloperId.toString(), fullname: user.Title, team : dev.Title, jobTitle:"", skills: []});
        });
        await this._getEmployeeSkills(dev.DeveloperId).then(skills => {
            developer.skills = skills;
        });
        return developer;
    }

    private async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      }

    private async getEmployeeList(): Promise<DeveloperAPI[]> {
        let developers : DeveloperAPI[] = [];
        await sp.web.lists.getByTitle("Employee List").items.get().then((items: DeveloperAPI[]) => {
            developers = items;
        });
        return developers;
    }
    public async getItems(): Promise<IDeveloper[]> {
        let developers : IDeveloper[] = [];
        await this.getEmployeeList().then(async result =>{
            await this.asyncForEach(result, async (dev) => {
                await this._constructDeveloper(dev).then(dev =>{ developers.push(dev)});
            });
        });

        return developers;
    }
}