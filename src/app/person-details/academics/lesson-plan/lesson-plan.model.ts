export interface LessonPlanQuery {
  clp_id: number;
  actual_date: string,
  period: number,
  course_ctopic_id: number,
  course_topic: {
    topic: string
  }
  references: string
}
export interface LessonPlanGroup {
  actual_date: string
  hours: number,
  topics: []
}

export interface LessonPlan {
  course_code: String
  group_ref: number
  session_ref: number
  actual_date: Date
  lessonPlanPeriods: LessonPlanModel[]
}
export interface LessonPlanModel {
  period: number;
  references: Reference[];
  selectedTopics: number[],
  selectedUnits: number[]
}
export interface Reference {
  ctopic_id: number;
  reference: string;
}
export interface CourseTopics {
  ctopic_id: number;
  course_code: string;
  module_num: number;
  topic_num: string;
  topic: string;
  conum: number;
}
