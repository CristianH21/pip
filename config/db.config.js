"use strict";

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db-pip',
  password: '123456',
  port: 5432,
});

const userLogin = ({ userNumber, password }) => {
    return new Promise( async (resolve, reject) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const queryText = `
              SELECT users.id, users.user_number, roles.role
              FROM users
              INNER JOIN user_roles
              ON users.id = user_roles.id_users_fk
              INNER JOIN roles
              ON user_roles.id_roles_fk = roles.id
              WHERE user_number = $1 
              AND users.password = $2
              AND users.enable = $3 
              AND users.deleted_logical = $4
            `;
            const res = await client.query(queryText, [userNumber, password, true, false]);
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
          SELECT users.id, users.user_number, users.user_type, roles.role  
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
            case 'student':
              getProfileInfo = await client.query('SELECT * FROM students WHERE student_number = $1', [user_number]);
              break;
            case 'staff':
              getProfileInfo = await client.query('SELECT * FROM staff WHERE staff_number = $1', [user_number]);
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
      password
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
      const userRes = await client.query(userQuery, [studentNumber, password, 'student', true, date, true, false]);
      const userId = userRes.rows[0].id;

      const studentQuery = `
      INSERT INTO students
      (student_number, first_name, last_name_father, last_name_mother, date_of_birth, gender, address, city, state, country, zip_code, reference, date_registered, enable, deleted_logical, id_users_fk)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`;
      const studentRes = await client.query(studentQuery, [studentNumber, firstName, lastNameFather, lastNameMother, dateOfBirth, gender, address, city, state, country, zipCode, reference, date, true, false, userId]);
      console.log('DB res: ', studentRes);
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
      const res = await client.query(queryText, [true, false, 'docente']);
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
      password
    } = data;

    const date = new Date().toISOString();

    try {
      await client.query('BEGIN');
      
      // Check if userNumber exists

      const existsQuery = `SELECT user_number FROM users WHERE user_number = $1`;
      const existsRes = await client.query(existsQuery, [staffNumber]);

      console.log('Does exists: ', existsRes);

      if (existsRes.rowCount > 0) throw Error('Matricula ya existe.');

      const userQuery = `
        INSERT INTO users 
        (user_number, password, user_type, new_user, date_registered, enable, deleted_logical)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
      const userRes = await client.query(userQuery, [staffNumber, password, 'staff', true, date, true, false]);
      const userId = userRes.rows[0].id;

      const staffTypeQuery = `SELECT id FROM staff_type WHERE type = $1 AND enable = $2 AND deleted_logical = $3`;
      const staffTypeRes = await client.query(staffTypeQuery, ['docente', true, false]);
      const staffTypeId = staffTypeRes.rows[0].id;
      
      const staffQuery = `
        INSERT INTO staff
        (staff_number, first_name, last_name_father, last_name_mother, date_of_birth, gender, address, city, state, country, zip_code, reference, date_registered, enable, deleted_logical, id_staff_type_fk, id_users_fk)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`;
      const staffRes = await client.query(staffQuery, [staffNumber, firstName, lastNameFather, lastNameMother, dateOfBirth, gender, address, city, state, country, zipCode, reference, date, true, false, staffTypeId, userId]);
      console.log('DB res: ', staffRes);
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

const addSubject = data => {
  return new Promise( async (resolve, reject) => {
    const client = await pool.connect();
    const { name, abbreviation } = data;
    const date = new Date().toISOString();
    try {
      await client.query('BEGIN');
      const queryText = `
        INSERT INTO subjects 
        (name, abbreviation, date_registered, enable, deleted_logical)
        VALUES
        ($1, $2, $3, $4, $5)`;
      const res = await client.query(queryText, [name, abbreviation, date, true, false]);
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

module.exports = {
  userLogin,
  getUserAuth,
  getProfileByUserId,
  updateProfile,
  getStudents,
  addStudent,
  getTeachers,
  addTeacher,
  getSubjects,
  addSubject,
  getGroups,
  addGroup,
  getStaff
}