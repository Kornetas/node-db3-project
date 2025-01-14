const db = require("../../data/db-config");

function find() {
  // EXERCISE A
  /*
    1A- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`.
    What happens if we change from a LEFT join to an INNER join?

      SELECT
          sc.*,
          count(st.step_id) as number_of_steps
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      GROUP BY sc.scheme_id
      ORDER BY sc.scheme_id ASC;

    2A- When you have a grasp on the query go ahead and build it in Knex.
    Return from this function the resulting dataset.
  */
  return db("schemes as sc")
    .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
    .select("sc.*")
    .count("st.step_id as number_of_steps")
    .groupBy("sc.scheme_id");
}

async function findById(scheme_id) {
  const rows = await db("schemes as sc")
    .leftJoin("steps as st", "sc.scheme_id", "st.scheme_id")
    .where("sc.scheme_id", scheme_id)
    .select("sc.scheme_name", "st.*", "sc.scheme_id")
    .orderBy("st.step_number");

  const res = {
    scheme_id: rows[0].scheme_id,
    scheme_name: rows[0].scheme_name,
    steps: [],
  };

  rows.forEach((row) => {
    if (row.step_id) {
      res.steps.push({
        step_id: row.step_id,
        step_number: row.step_number,
        instructions: row.instructions,
      });
    }
  });

  return res;
}

async function findSteps(scheme_id) {
  // EXERCISE C
  /*
    1C- Build a query in Knex that returns the following data.
    The steps should be sorted by step_number, and the array
    should be empty if there are no steps for the scheme:

      [
        {
          "step_id": 5,
          "step_number": 1,
          "instructions": "collect all the sheep in Scotland",
          "scheme_name": "Get Rich Quick"
        },
        {
          "step_id": 4,
          "step_number": 2,
          "instructions": "profit",
          "scheme_name": "Get Rich Quick"
        }
      ]
  */

  const row = await db("steps")
    .leftJoin("schemes", "steps.scheme_id", "schemes.scheme_id")
    .select("step_id", "step_number", "instructions", "scheme_name")
    .where("steps.scheme_id", scheme_id)
    .orderBy("step_number", "asc");

  return row;
}

function add(scheme) {
  return db("schemes")
    .insert(scheme)
    .then(([scheme_id]) => {
      return db("schemes").where("scheme_id", scheme_id).first();
    });
  // EXERCISE D
  /*
    1D- This function creates a new scheme and resolves to _the newly created scheme_.
  */
}

function addStep(scheme_id, step) {
  // EXERCISE E
  return db("steps")
    .insert({
      ...step,
      scheme_id,
    })
    .then(() => {
      return db("steps as st")
        .join("schemes as sc", "sc.scheme_id", "st.scheme_id")
        .select("step_id", "step_number", "instructions", "scheme_name")
        .orderBy("step_number")
        .where("sc.scheme_id", scheme_id);
    });
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
};
