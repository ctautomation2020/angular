import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { PersonDetailsService } from '../person-details.service';
import { AcademicsModel } from './academics.model';

@Injectable({
  providedIn: 'root'
})
export class AcademicsService {
  // session: AcademicsModel;
  category = 'Session';
  constructor(private apollo: Apollo, private personDetails: PersonDetailsService) { }
  getCourseRegisteredStudents(query: any) {
    const req = gql `
    query registered_students($data: registered_studentsQueryInput!) {
      registered_students(data: $data) {
        course_code
        reg_no
        group_ref
        session_ref
        student {
          reg_no
          name
        }
      }
    }
    `;
    return this.apollo.watchQuery({
      query: req,
      variables: {
        data: query
      }
    }).valueChanges.pipe(map((result: any) =>
    JSON.parse(JSON.stringify(result.data.registered_students))
    ));

  }
  getCourseTopics(course_code: string) {
    const req = gql`
    query course_topic($data: course_topicQueryInput!) {
      course_topic(data: $data) {
        ctopic_id
        module_num
        topic_num
        topic
      }
      }
    `;
    return this.apollo.watchQuery({
      query: req,
      variables: {
        data: {
          course_code: course_code
        }
      },
      fetchPolicy: 'no-cache'
    }).valueChanges.pipe(map((result: any) =>
    JSON.parse(JSON.stringify(result.data.course_topic))
    ));

  }
  getLessonPlan(query : any) {
    const req = gql`
    query course_lessonplan($data: course_lessonplanQueryInput!) {
      course_lessonplan(data: $data) {
        actual_date
        period
        course_topic {
          topic
        }
        references
      }
      }
    `;
    return this.apollo.watchQuery({
      query: req,
      variables: {
        data: query
      },
      fetchPolicy: 'no-cache'
    }).valueChanges.pipe(map((result: any) =>
    JSON.parse(JSON.stringify(result.data.course_lessonplan))
    ));
  }
  getAttendance(query: any) {
    const req = gql`
    query attendance($data: course_attendanceQueryInput!) {
      attendance(data: $data) {
        course_code
        group_ref
        session_ref
        period
        presence
        student {
          reg_no
          name
        }
      }
      }
    `;
    return this.apollo.watchQuery({
      query: req,
      variables: {
        data: query
      },
      fetchPolicy: 'no-cache'
    }).valueChanges.pipe(map((result: any) =>
    JSON.parse(JSON.stringify(result.data.attendance))
    ));

  }
  getEvaluation(query: any) {
    const req = gql `
    query assess_evaluation($data: assess_evaluationQueryInput!) {
      assess_evaluation(data: $data) {
        question_num
        mark
      }
    }
    `;
    return this.apollo.watchQuery({
      query: req,
      variables: {
        data: query
      },
      fetchPolicy: 'no-cache'
    }).valueChanges.pipe(map((result: any) =>
    JSON.parse(JSON.stringify(result.data.assess_evaluation))
    ));
  }
  getAssignmentEvaluation(query: any) {
    const req = gql `
    query assign_evaluation($data: assign_evaluationQueryInput!) {
      assign_evaluation(data: $data) {
        question_num
        mark
      }
    }
    `;
    return this.apollo.watchQuery({
      query: req,
      variables: {
        data: query
      },
      fetchPolicy: 'no-cache'
    }).valueChanges.pipe(map((result: any) =>
    JSON.parse(JSON.stringify(result.data.assign_evaluation))
    ));
  }
  getAssignment(query: any) {
    const req = gql`
  query assignment($data: assignmentQueryInput!) {
    assignment(data: $data) {
      cassign_id
      course_code
      group_ref
      session_ref
      entry_date
      assign_num
      question_num
      question_stmt
      co_num
      marks
      deadline
    }
  }
  `;
  return this.apollo
  .watchQuery({
    query: req,
    variables: {
      data: query
    },
    fetchPolicy: 'no-cache'
  }).valueChanges.pipe(map((result: any) =>
  JSON.parse(JSON.stringify(result.data.assignment))
  ));
  }
  getAssessment(query: any) {
    const req = gql`
  query assessment($data: assesmentQueryInput!) {
    assessment(data: $data) {
      cassess_id
      course_code
      group_ref
      session_ref
      assess_num
      question_num
      question_stmt
      blooms_level
      co_num
      marks
      section
    }
  }
  `;
  return this.apollo
  .watchQuery({
    query: req,
    variables: {
      data: query
    },
    fetchPolicy: 'no-cache'
  }).valueChanges.pipe(map((result: any) =>
  JSON.parse(JSON.stringify(result.data.assessment))
  ));
  }
  getCourse(course_code: string) {
    const reqNew = gql`
          query course($data: courseQueryInput!) {
          course(data: $data) {
            course_code
            title
          }
        }
        `;
    return this.apollo
    .watchQuery<any>({
      query: reqNew,
      variables: {
        data: {
          course_code : course_code
        }
      }
    }).valueChanges.pipe(map((result: any) =>
    JSON.parse(JSON.stringify(result.data.course))
    ));
  }
  getAssessmentList(json: any) {
    const req = gql`
        query session_assessments($data: sessionQueryInput!) {
        session_assessments(data: $data)
    }
    `;
      return  this.apollo
        .watchQuery<any>({
          query: req,
          variables: {
            data: json
          },
          fetchPolicy: 'no-cache'
        }).valueChanges.pipe(map((result: any) =>
        JSON.parse(JSON.stringify(result.data.session_assessments))
        ));

  }
  getAssignmentList(json: any) {
    const req = gql`
        query session_assignments($data: sessionQueryInput!) {
        session_assignments(data: $data)
    }
    `;
      return  this.apollo
        .watchQuery<any>({
          query: req,
          variables: {
            data: json
          },
          fetchPolicy: 'no-cache'
        }).valueChanges.pipe(map((result: any) =>
        JSON.parse(JSON.stringify(result.data.session_assignments))
        ));

  }
  getCourseDetails(json: any) {
    const req = gql`
        query courseDetails($data: courseDetailsQueryInput!) {
        courseDetails(data: $data) {
        sallot_id
        course_code
        group_ref
        session_ref
      }
    }
    `;
      return  this.apollo
        .watchQuery<any>({
          query: req,
          variables: {
            data: json
          }
        }).valueChanges.pipe(map((result: any) =>
        JSON.parse(JSON.stringify(result.data.courseDetails))
        ));
  }
  getStaffCourses(json: any) {
    const req = gql`
        query staffCourses($data: staffCoursesQueryInput!) {
      staffCourses(data: $data) {
        sallot_id
        course_code
        group_ref
        session_ref
      }
    }
    `;
      return  this.apollo
        .watchQuery<any>({
          query: req,
          variables: {
            data: json
          }
        }).valueChanges.pipe(map((result: any) =>
        JSON.parse(JSON.stringify(result.data.staffCourses))
        ));
  }
  getSession(reference_id: number) {
    const req = gql`
    query
    courseReference($data: Course_Reference_Input) {
      courseReference(data: $data) {
        reference_id
        ref_code
        description
      }
    }
    `;
     return this.apollo.watchQuery({
      query: req,
      variables: {
        data: {
          category: this.category,
          reference_id: reference_id
        }
      }
    }).valueChanges.pipe(map((result: any) =>
    JSON.parse(JSON.stringify(result.data.courseReference))
    ));
  }
}
