"use strict";

require('dotenv').config();
const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const userLogin = ({ userNumber, password }) => {
    return new Promise( async (resolve, reject) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const queryText = `
              SELECT users.id, users.user_number, users.password, roles.role
              FROM users
              INNER JOIN user_roles
              ON users.id = user_roles.id_users_fk
              INNER JOIN roles
              ON user_roles.id_roles_fk = roles.id
              WHERE users.user_number = $1
              AND users.enable = $2 
              AND users.deleted_logical = $3
            `;
            const res = await client.query(queryText, [userNumber, true, false]);
            await client.query('COMMIT');
            resolve(res);
          } catch (error) {
            await client.query('ROLLBACK');
            reject(error);
          } finally {
            client.release();
          }
    });
};

const getUserAuth = userId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const queryText = `
          SELECT users.id, users.user_number, users.user_type, users.new_user, roles.role  
          FROM users 
          INNER JOIN user_roles
          ON users.id = user_roles.id_users_fk
          INNER JOIN roles
          ON user_roles.id_roles_fk = roles.id
          WHERE users.id = $1
          AND users.enable = $2
          AND users.deleted_logical = $3
        `;
        const res = await client.query(queryText, [userId, true, false]);
        
        resolve(res);
      } catch (error) {
        await client.query('ROLLBACK');
        reject(error);
      } finally {
        client.release();
      }
  });
}

const getProfileByUserId = userId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const queryText = 'SELECT user_type, user_number FROM users WHERE id = $1 AND enable = $2 AND deleted_logical = $3';
        const res = await client.query(queryText, [userId, true, false]);
        if (res.rowCount > 0) {
          let getProfileInfo;
          const { user_type, user_number } = res.rows[0];
          switch (user_type) {
            case 'students':
              getProfileInfo = await client.query('SELECT * FROM students WHERE student_number = $1', [user_number]);
              break;
            case 'staff':
              getProfileInfo = await client.query('SELECT * FROM staff WHERE staff_number = $1', [user_number]);
              break;
            case 'admin':
              getProfileInfo = await client.query('SELECT * FROM admin WHERE admin_username = $1', [user_number]);
              break;
            default:
              break;
          }
          await client.query('COMMIT');
          resolve(getProfileInfo);
        } else {
          reject('Problema con el usuario.');
        }
      } catch (error) {
        await client.query('ROLLBACK');
        reject(error);
      } finally {
        client.release();
      }
  });
}

const updateProfile = (userId, data, userType, profileType) => {
  return new Promise( async (resolve, reject) => {
    console.log(userId, data, userType, profileType);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let queryText, res;
      
      switch(profileType) {
        case 'personal': 
          queryText = `
            UPDATE ${userType}
            SET date_of_birth = $1, gender = $2
            WHERE id_users_fk = $3 AND enable = $4 AND deleted_logical = $5
          `;
          res = await client.query(queryText, [data.dateOfBirth, data.gender, userId, true, false]);
          break;
        case 'address':
          queryText = `
            UPDATE ${userType}
            SET address = $1, city = $2, state = $3, zip_code = $4
            WHERE id_users_fk = $5 AND enable = $6 AND deleted_logical = $7
          `;
          res = await client.query(queryText, [data.address, data.city, data.state, data.zipCode, userId, true, false]);
          break;
        default: break;
      }
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getStudents = userId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `SELECT * FROM students WHERE enable = $1 AND deleted_logical = $2`;
      const res = await client.query(queryText, [true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const addStudent = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const {
      studentNumber,
      firstName,
      lastNameFather,
      lastNameMother,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      reference,
      hash
    } = data;

    const date = new Date().toISOString();

    try {
      await client.query('BEGIN');

      const existsQuery = `SELECT user_number FROM users WHERE user_number = $1`;
      const existsRes = await client.query(existsQuery, [studentNumber]);

      if (existsRes.rowCount > 0) throw Error('Matricula ya existe.');

      const userQuery = `
        INSERT INTO users 
        (user_number, password, user_type, new_user, date_registered, enable, deleted_logical)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
      const userRes = await client.query(userQuery, [studentNumber, hash, 'students', true, date, true, false]);
      const userId = userRes.rows[0].id;

      const roleQuery = `SELECT id FROM roles WHERE role = $1 AND enable = $2 AND deleted_logical = $3`;
      const roleRes = await client.query(roleQuery, ['student', true, false]);
      const roleId = roleRes.rows[0].id;

      const userRoleQuery = `
        INSERT INTO user_roles
        (id_users_fk, id_roles_fk, date_registered, enable, deleted_logical)
        VALUES
        ($1, $2, $3, $4, $5)`;
      await client.query(userRoleQuery, [userId, roleId, date, true, false]);

      const studentQuery = `
        INSERT INTO students
        (student_number, first_name, last_name_father, last_name_mother, date_of_birth, gender, address, city, state, country, zip_code, reference, date_registered, enable, deleted_logical, id_users_fk)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`;
      const studentRes = await client.query(studentQuery, [studentNumber, firstName, lastNameFather, lastNameMother, dateOfBirth, gender, address, city, state, country, zipCode, reference, date, true, false, userId]);
      await client.query('COMMIT');
      resolve(studentRes);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getStudentById = studentId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `SELECT * FROM students WHERE id = $1 AND enable = $2 AND deleted_logical = $3`;
      const res = await client.query(queryText, [studentId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const updateStudent = (data, studentId) => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const {
      studentNumber,
      firstName,
      lastNameFather,
      lastNameMother,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      reference,
    } = data;
    try {
      await client.query('BEGIN');
      const queryText = `
        UPDATE students
        SET student_number = $1, first_name = $2, last_name_father = $3, last_name_mother = $4, date_of_birth = $5,
        gender = $6, address = $7, city = $8, state = $9, country = $10, zip_code = $11, reference = $12
        WHERE id = $13 AND enable = $14 AND deleted_logical = $15`;
      const res = await client.query(queryText, [studentNumber, firstName, lastNameFather, lastNameMother,
        dateOfBirth, gender, address, city, state, country, zipCode, reference, studentId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const delStudent = studentId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        UPDATE students
        SET enable = $1, deleted_logical = $2 
        WHERE id = $3`;
      const res = await client.query(queryText, [false, true, studentId]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const getTeachers = userId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT s.* 
        FROM staff_type st
        RIGHT JOIN staff s
        ON s.id_staff_type_fk = st.id
        WHERE s.enable = $1 AND s.deleted_logical = $2 AND st.type = $3`;
      const res = await client.query(queryText, [true, false, 'teacher']);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const addTeacher = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const {
      staffNumber,
      firstName,
      lastNameFather,
      lastNameMother,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      reference,
      hash
    } = data;

    const date = new Date().toISOString();

    try {
      await client.query('BEGIN');
      
      // Check if userNumber exists

      const existsQuery = `SELECT user_number FROM users WHERE user_number = $1`;
      const existsRes = await client.query(existsQuery, [staffNumber]);

      if (existsRes.rowCount > 0) throw Error('Matricula ya existe.');

      const userQuery = `
        INSERT INTO users 
        (user_number, password, user_type, new_user, date_registered, enable, deleted_logical)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
      const userRes = await client.query(userQuery, [staffNumber, hash, 'staff', true, date, true, false]);
      const userId = userRes.rows[0].id;

      const roleQuery = `SELECT id FROM roles WHERE role = $1 AND enable = $2 AND deleted_logical = $3`;
      const roleRes = await client.query(roleQuery, ['teacher', true, false]);
      const roleId = roleRes.rows[0].id;

      const userRoleQuery = `
        INSERT INTO user_roles
        (id_users_fk, id_roles_fk, date_registered, enable, deleted_logical)
        VALUES
        ($1, $2, $3, $4, $5)`;
      await client.query(userRoleQuery, [userId, roleId, date, true, false]);

      const staffTypeQuery = `SELECT id FROM staff_type WHERE type = $1 AND enable = $2 AND deleted_logical = $3`;
      const staffTypeRes = await client.query(staffTypeQuery, ['teacher', true, false]);
      const staffTypeId = staffTypeRes.rows[0].id;
      
      const staffQuery = `
        INSERT INTO staff
        (staff_number, first_name, last_name_father, last_name_mother, date_of_birth, gender, address, city, state, country, zip_code, reference, date_registered, enable, deleted_logical, id_staff_type_fk, id_users_fk)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`;
      const staffRes = await client.query(staffQuery, [staffNumber, firstName, lastNameFather, lastNameMother, dateOfBirth, gender, address, city, state, country, zipCode, reference, date, true, false, staffTypeId, userId]);
      await client.query('COMMIT');
      resolve(staffRes);
    } catch (error) {
      console.log('Add teacher error', error);
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getSubjects = () => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `SELECT * FROM subjects WHERE enable = $1 AND deleted_logical = $2`;
      const res = await client.query(queryText, [true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const getTeacherById = teacherId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `SELECT * FROM staff WHERE id = $1 AND enable = $2 AND deleted_logical = $3`;
      const res = await client.query(queryText, [teacherId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const updateTeacher = (data, teacherId) => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const {
      staffNumber,
      firstName,
      lastNameFather,
      lastNameMother,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      zipCode,
      reference,
    } = data;
    try {
      await client.query('BEGIN');
      const queryText = `
        UPDATE staff
        SET staff_number = $1, first_name = $2, last_name_father = $3, last_name_mother = $4, date_of_birth = $5,
        gender = $6, address = $7, city = $8, state = $9, country = $10, zip_code = $11, reference = $12
        WHERE id = $13 AND enable = $14 AND deleted_logical = $15`;
      const res = await client.query(queryText, [staffNumber, firstName, lastNameFather, lastNameMother,
        dateOfBirth, gender, address, city, state, country, zipCode, reference, teacherId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const delTeacher = teacherId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        UPDATE staff
        SET enable = $1, deleted_logical = $2 
        WHERE id = $3`;
      const res = await client.query(queryText, [false, true, teacherId]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const addSubject = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { name, abbreviation, grade } = data;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
        INSERT INTO subjects 
        (name, abbreviation, grade, date_registered, enable, deleted_logical)
        VALUES
        ($1, $2, $3, $4, $5, $6)`;
      const res = await client.query(queryText, [name, abbreviation, grade, date, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const updateSubject = (data, subjectId) => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { name, abbreviation, grade } = data;
    try {
      await client.query('BEGIN');
      const queryText = `
      UPDATE subjects
      SET name = $1, abbreviation = $2, grade = $3
      WHERE id = $4 AND enable = $5 AND deleted_logical = $6`;
      const res = await client.query(queryText, [name, abbreviation, grade, subjectId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const delSubject = subjectId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        UPDATE subjects
        SET enable = $1, deleted_logical = $2
        WHERE id = $3`;
      const res = await client.query(queryText, [false, true, subjectId]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const getSubjectById = subjectId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `SELECT * FROM subjects WHERE id = $1 AND enable = $2 AND deleted_logical = $3`;
      const res = await client.query(queryText, [subjectId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const getSubjectsByStudent = studentId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    let subjects = {
      rowCount: 0,
      rows: []
    };
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT c.id as classroom_id
        FROM classrooms c
        INNER JOIN classrooms_students cs
        ON cs.id_classrooms_fk = c.id
        WHERE cs.id_students_fk = $1
        AND cs.enable = $2
        AND cs.deleted_logical = $3
      `;
      const res = await client.query(queryText, [studentId, true, false]);

      res.rows.forEach( async (classroom) => {
        const subjectsRes = await client.query(`
          SELECT s.id as subject_id, s.name, cr.room, cr.section, cr.year, c.id as class_id
          FROM subjects s
          INNER JOIN classes c
          ON c.id_subjects_fk = s.id
          INNER JOIN classrooms cr
          ON cr.id = c.id_classrooms_fk
          WHERE c.id_classrooms_fk = $1
          AND c.enable = $2
          AND c.deleted_logical = $3`,
        [classroom.classroom_id, true, false]);

        subjectsRes.rows.forEach( async (subject) => {
          subjects.rows.push(subject);
        });
        subjects.rowCount = subjects.rows.length;
      });

      await client.query('COMMIT');
      resolve(subjects);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });  
}

const getSubjectsByTeacher = teacherId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT cr.id as classroom_id, cr.room, cr.section, s.name, c.id as class_id, c.enable, c.deleted_logical
        FROM classes c
        INNER JOIN classrooms cr
        ON cr.id = c.id_classrooms_fk
        INNER JOIN subjects s
        ON s.id = c.id_subjects_fk
        WHERE cr.id_staff_fk = $1
        AND c.enable = $2
        AND c.deleted_logical = $3
      `;
      const res = await client.query(queryText, [teacherId, true, false]);

      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });  
}

const getGroups = () => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `SELECT * FROM groups WHERE enable = $1 AND deleted_logical = $2`;
      const res = await client.query(queryText, [true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const addGroup = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { name, grade, staffId, subjectArr } = data;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
        INSERT INTO groups 
        (name, grade, date_registered, enable, deleted_logical, id_staff_fk)
        VALUES
        ($1, $2, $3, $4, $5, $6) RETURNING id`;
      const res = await client.query(queryText, [name, grade, date, true, false, staffId]);
      
      // AssignSubjects to group 
      subjectArr.forEach( async (subject) => {
        let subjectRes = await client.query(`INSERT INTO assigned_subject 
        (date_registered, enable, deleted_logical, id_subject_fk, id_group_fk) 
        VALUES ($1, $2, $3, $4, $5)`,
        [date, true, false, subject.key, res.rows[0].id]);
      });
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const getStaff = () => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `SELECT * FROM staff WHERE enable = $1 AND deleted_logical = $2`;
      const res = await client.query(queryText, [true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

const getClassrooms = () => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `SELECT * FROM classrooms WHERE enable = $1 AND deleted_logical = $2`;
      const res = await client.query(queryText, [true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const addClassroom = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { section, room, year, staffId } = data;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
        INSERT INTO classrooms
        (section, room, year, date_registered, enable, deleted_logical, id_staff_fk)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `;
      const res = await client.query(queryText, [section, room, year, date, true, false, staffId]);
      const classroomId = res.rows[0].id;

      const querySubjects = `
        SELECT id FROM subjects WHERE grade = $1 
        AND enable = $2 AND deleted_logical = $3`;
      const resSubjects = await client.query(querySubjects, [room, true, false]);

      console.log('subjects: ', resSubjects)
      
      resSubjects.rows.forEach( async (subject) => {
        await client.query(`
          INSERT INTO classes 
          (id_subjects_fk, id_classrooms_fk, date_registered, enable, deleted_logical) 
          VALUES ($1, $2, $3, $4, $5)`,
          [subject.id, classroomId, date, false, false]);
      });

      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getClassroomById = id => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT classrooms.id, classrooms.section, classrooms.room, classrooms.year,
        staff.id AS staff_id, staff.staff_number, staff.first_name, staff.last_name_father, staff.last_name_mother
        FROM classrooms
        INNER JOIN staff
        ON classrooms.id_staff_fk = staff.id
        WHERE classrooms.id = $1 AND classrooms.enable = $2 AND classrooms.deleted_logical = $3`;
      const res = await client.query(queryText, [id, true, false]);

      const subjectsQuery = `
        SELECT s.id, s.name, c.enable
        FROM subjects s
        INNER JOIN classes c
        ON c.id_subjects_fk = s.id
        WHERE c.id_classrooms_fk = $1
        AND s.enable = $2
        AND s.deleted_logical = $3
      `;
      const subjectsRes = await client.query(subjectsQuery, [id, true, false]);

      const studentsQuery = `
        SELECT s.id, s.student_number, s.first_name, s.last_name_father, s.last_name_mother
        FROM students s
        INNER JOIN classrooms_students cs
        ON cs.id_students_fk = s.id
        WHERE cs.id_classrooms_fk = $1
        AND cs.enable = $2
        AND cs.deleted_logical = $3
      `;
      const studentsRes = await client.query(studentsQuery, [id, true, false]);

      res.rows[0].subjects = subjectsRes.rows;
      res.rows[0].students = studentsRes.rows;

      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const updateClassroom = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { id, room, section, year, staffId, subjects, students } = data;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
        UPDATE classrooms
        SET room = $1, section = $2, year = $3, id_staff_fk = $4
        WHERE id = $5 AND enable = $6 AND deleted_logical = $7`;
      const res = await client.query(queryText, [room, section, year, staffId, id, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const updateClassroomStudents = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { classroom_id, students } = data;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
      SELECT id_students_fk FROM classrooms_students 
      WHERE id_classrooms_fk = $1 AND enable = $2 AND deleted_logical = $3`;
      const res = await client.query(queryText, [classroom_id, true, false]);
      console.log(res);
      if (res.rowCount > 0 ) {
        const toInsert = students.filter(i => !res.rows.some(j => j.id_students_fk === i.id));
        console.log('toInsert: ', toInsert);
        toInsert.forEach( async (student) => {
          await client.query(`
          INSERT INTO classrooms_students
          (id_classrooms_fk, id_students_fk, date_registered, enable, deleted_logical) 
          VALUES ($1, $2, $3, $4, $5)`,
          [classroom_id, student.id, date, true, false]);
        });
        res.rowCount = toInsert.length;
        res.rows = toInsert;
      } else {
        students.forEach( async (student) => {
          await client.query(`
          INSERT INTO classrooms_students
          (id_classrooms_fk, id_students_fk, date_registered, enable, deleted_logical) 
          VALUES ($1, $2, $3, $4, $5)`,
          [classroom_id, student.id, date, true, false]);
        });
        res.rowCount = students.length;
        res.rows = students;
      }
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const updateClassroomSubjects = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { classroom_id, subjects } = data;
    //const date = new Date().toISOString();
    let res = {
      rows: [],
      rowCount: 0
    };
    try {
      await client.query('BEGIN');
      subjects.forEach( async (subject) => {
        let resSubject = await client.query(`
          UPDATE classes
          SET enable = $1
          WHERE id_subjects_fk = $2 AND id_classrooms_fk = $3 AND deleted_logical = $4
          RETURNING id
        `, 
        [subject.enable, subject.id, classroom_id, false]);
        res.rows.push(resSubject.rows[0]);
        res.rowCount = res.rows.length;
      });
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const updatePassword = (userId, hash) => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        UPDATE users
        SET password = $1, new_user = $2
        WHERE id = $3 AND enable = $4 AND deleted_logical = $5 RETURNING user_number`;
      const res = await client.query(queryText, [hash, false, userId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getClassworkByClass = () => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT cr.id as classroom_id, cr.room, cr.section, s.name, c.id as class_id, c.enable, c.deleted_logical
        FROM classes c
        INNER JOIN classrooms cr
        ON cr.id = c.id_classrooms_fk
        INNER JOIN subjects s
        ON s.id = c.id_subjects_fk
        WHERE cr.id_staff_fk = $1
        AND c.enable = $2
        AND c.deleted_logical = $3
      `;
      const res = await client.query(queryText, [teacherId, true, false]);

      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const addPeriod = (classId, data) => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { name } = data;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
        INSERT INTO periods
        (name, id_classes_fk, date_registered, enable, deleted_logical) 
        VALUES ($1, $2, $3, $4, $5)`;
      const res = await client.query(queryText, [name, classId, date, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getClasswork = classId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT * FROM periods WHERE id_classes_fk = $1 AND enable = $2 AND deleted_logical = $3`;
      const res = await client.query(queryText, [classId, true, false]);

      res.rows.forEach(async (period, index) => {
        res.rows[index].assignments = null;
        const assignmentsRes = await client.query(`
          SELECT * FROM assignments WHERE id_periods_fk = $1 AND enable = $2 AND deleted_logical = $3`,
          [period.id, true, false]);
          res.rows[index].assignments = assignmentsRes.rows;
          console.log(res.rows[index]);
      });

      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getClassworkByStudent = classId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT * FROM periods WHERE id_classes_fk = $1 AND enable = $2 AND deleted_logical = $3`;
      const res = await client.query(queryText, [classId, true, false]);

      res.rows.forEach(async (period, index) => {
        res.rows[index].assignments = null;
        const assignmentsRes = await client.query(`
          SELECT a.id, a.type, a.title, a.instructions, a.date_registered, ass.delivered
          FROM assignments a
          LEFT JOIN assignments_students ass
          ON ass.id_assignments_fk = a.id
          WHERE a.id_periods_fk = $1 AND a.enable = $2 AND a.deleted_logical = $3`,
          [period.id, true, false]);
          res.rows[index].assignments = assignmentsRes.rows;
          console.log(res.rows[index]);
      });

      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const addAssignment = (periodId, data) => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { type, title, instructions } = data;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
        INSERT INTO assignments
        (type, title, instructions, id_periods_fk, date_registered, enable, deleted_logical) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`;
      const res = await client.query(queryText, [type, title, instructions, periodId, date, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getAssignmentById = assignmentId => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT * FROM assignments WHERE id = $1 AND enable = $2 AND deleted_logical = $3`;
      const res = await client.query(queryText, [assignmentId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const addStudentAssignment = (studentId, assignmentId, file, fileLink, comment) => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { name, size, mimetype } = file;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
        INSERT INTO assignments_students
        (file_name, file_size, file_mimetype, file_link, comment, points, delivered, returned, date_registered, enable, deleted_logical, id_assignments_fk, id_students_fk) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
      const res = await client.query(queryText, [name, size, mimetype, fileLink, comment, 0, true, false, date, true, false, assignmentId, studentId]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      console.error(error);
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  });
}

const getAssignmentByStudent = (assignmentId, studentId) => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const queryText = `
        SELECT file_link, delivered, returned
        FROM assignments_students
        WHERE id_assignments_fk = $1 AND id_students_fk = $2 AND enable = $3 AND deleted_logical = $4`;
      const res = await client.query(queryText, [assignmentId, studentId, true, false]);
      await client.query('COMMIT');
      resolve(res);
    } catch (error) {
      console.error(error)
      await client.query('ROLLBACK');
      reject(error);
    } finally {
      client.release();
    }
  }); 
}

module.exports = {
  userLogin,
  getUserAuth,
  getProfileByUserId,
  updateProfile,
  getStudents,
  addStudent,
  getStudentById,
  updateStudent,
  delStudent,
  getTeachers,
  addTeacher,
  getTeacherById,
  updateTeacher,
  delTeacher,
  getSubjects,
  addSubject,
  updateSubject,
  delSubject,
  getSubjectById,
  getSubjectsByStudent,
  getSubjectsByTeacher,
  getGroups,
  addGroup,
  getStaff,
  getClassrooms,
  addClassroom,
  getClassroomById,
  updateClassroom,
  updateClassroomStudents,
  updateClassroomSubjects,
  updatePassword,
  getClassworkByClass,
  addPeriod,
  getClasswork,
  getClassworkByStudent,
  addAssignment,
  getAssignmentById,
  addStudentAssignment,
  getAssignmentByStudent
}