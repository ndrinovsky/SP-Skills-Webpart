import { ISkill } from "./ISkill";
import { ISkillSet } from "./ISkillSet";

export interface IDeveloper {
    id:string;
    //givenName: string;
    jobTitle: string;
    //surname: string;
    fullname: string;
    team: string;
    skills: ISkillSet[];
}
