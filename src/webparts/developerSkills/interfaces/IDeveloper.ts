import { ISkill } from "./ISkill";
import { ISkillSet } from "./ISkillSet";

export interface IDeveloper {
    ID:number;
    developerId:string;
    //givenName: string;
    jobTitle: string;
    //surname: string;
    fullname: string;
    team: string;
    skills: ISkillSet[];
    workHours: string;
    workPhone: string;
    afterHoursPhone: string;
}
