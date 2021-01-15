export interface PublicationModel {
  Person_ID: number;
  Publication_ID: number;
  Publication_Type_Ref: number;
  Level_Ref: number;
  Paper_Title: string;
  First_Author: string;
  Second_Author: string;
  Other_Authors: string;
  Journal_Name: string;
  Volume: number;
  Issue: number;
  DOI: string;
  Year_Of_Publish: number;
  Start_Page_No: number;
  End_Page_No: number;
  Publisher: string;
  Impact_Factor: number;
}
