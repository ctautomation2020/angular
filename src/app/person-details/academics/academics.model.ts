export interface AcademicsModel {
  reference_id: number;
  ref_code: number;
  category: string;
  ref_name: string;
  description: string;
}

export interface Assignment {
  deadline: Date;
  entry_date: Date;
  course_code: string;
  group_ref: number;
  session_ref: number;
  assign_num: number;
  questions: AssignmentQuestion[]
}

export interface Assessment {
  section: Section[];
  assess_num: number;
  course_code: string;
  group_ref: number;
  session_ref: number;
  entry_date: Date;
}
export interface Section {
  name: string;
  section_mark: number;
  q_num: number;
  type: string;
  questions: Question[]
}
export interface AssignmentQuestion {
  question_num: string;
  question_stmt: string;
  marks: number;
  co_num: number;
  max_marks?: number;
}
export interface Question {
  question_num: string;
  question_stmt: string;
  marks: number;
  blooms_level: number;
  co_num: number;
}

export interface AssignmentEvaluationQuestion {
  question_num: number;
  mark: number;
}
export interface EvaluationQuestion {
  question_num: string;
  mark: number;
}
export interface Evaluation {
  course_code: string;
  group_ref: number;
  session_ref: number;
  assess_num: number;
  reg_no: number;
  questions: EvaluationQuestion[],
  total_mark: number;
}
export interface AssignmentEvaluation {
  course_code: string;
  group_ref: number;
  session_ref: number;
  assign_num: number;
  reg_no: number;
  total_mark: number;
  questions: AssignmentEvaluationQuestion[]
}
