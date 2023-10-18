require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const db = require("./db");

const port = process.env.PORT || 3030;
const host = process.env.HOST || "localhost";

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes

// get all activitiess
app.get("/activity-groups", async (req, res) => {
  try {
    let field = "activity_id AS id,title,email";
    let table = "activities";
    const data = await db.find(table, field);
    res.json({
      status: "Success",
      message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// // get one activity
app.get("/activity-groups/:activity_id", async (req, res) => {
  try {
    const { activity_id } = req.params;
    let field = "activity_id AS id,activity_id AS id,title,email";
    let table = "activities";
    let data = await db.findOne(table, field, activity_id, "activity_id");
    if (!data) {
      return res.status(404).json({
        status: "Not Found",
        message: `Activity with ID ${activity_id} Not Found`,
      });
    }
    res.json({
      status: "Success",
      message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// create activity
app.post("/activity-groups", async (req, res) => {
  try {
    const { title, email } = req.body;

    if (
      req.body.title === "" ||
      !req.body.title ||
      req.body.email === "" ||
      !req.body.email
    ) {
      return res.status(400).json({
        status: "Bad Request",
        message: "title cannot be null",
      });
    }
    let field = "title,email";
    let table = "activities";
    let value = `'${title}', '${email}'`;
    const data = await db.create(table, field, value, "activity_id");

    return res.status(201).json({
      status: "Success",
      message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// // delete activity
app.delete("/activity-groups/:activity_id", async (req, res) => {
  try {
    const { activity_id } = req.params;

    let field = "activity_id AS id,title,email";
    let table = "activities";
    let validateData = await db.findOne(
      table,
      field,
      activity_id,
      "activity_id"
    );
    if (validateData === undefined) {
      return res.status(404).json({
        status: "Not Found",
        message: `Activity with ID ${activity_id} Not Found`,
      });
    }

    await db.destroy(table, activity_id, "activity_id");

    res.json({
      status: "Success",
      message: "Success",
      data: {},
    });
  } catch (error) {
    console.log(error);
  }
});

// // update activity
app.patch("/activity-groups/:activity_id", async (req, res) => {
  try {
    const { activity_id } = req.params;
    const { title } = req.body;
    let field = "activity_id AS id,title,email";
    let table = "activities";
    let value = `title = '${title}'`;
    let validateData = await db.findOne(
      table,
      field,
      activity_id,
      "activity_id"
    );
    if (!validateData) {
      return res.status(404).json({
        status: "Not Found",
        message: `Activity with ID ${activity_id} Not Found`,
      });
    }

    if (!req.body.title || req.body.title === "") {
      return res.status(400).json({
        status: "Bad Request",
        message: "title cannot be null",
      });
    }
    const data = await db.update(
      table,
      field,
      activity_id,
      value,
      "activity_id"
    );

    res.status(200).json({
      status: "Success",
      message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// =========================================end restfull activity ====================================//

// get all todos without query
app.get("/todo-items", async (req, res) => {
  try {
    const activityGroupId = req.query.activity_group_id;
    let field = "todo_id AS id,activity_group_id,title,is_active,priority";
    let table = "todos";
    const data = await db.find(table, field, activityGroupId);
    res.json({
      status: "Success",
      message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// // get one todo
app.get("/todo-items/:todo_id", async (req, res) => {
  try {
    const { todo_id } = req.params;
    let field = "todo_id AS id,activity_group_id,title,is_active,priority";
    let table = "todos";
    let data = await db.findOne(table, field, todo_id, "todo_id");
    if (data === undefined) {
      return res.status(404).json({
        status: "Not Found",
        message: `Todo with ID ${todo_id} Not Found`,
      });
    }

    res.status(200).json({
      status: "Success",
      // message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// create todo
app.post("/todo-items", async (req, res) => {
  try {
    // const body = req.body;
    const { title, activity_group_id, is_active = true } = req.body;

    if (!req.body.title) {
      return res.status(400).json({
        status: "Bad Request",
        message: "title cannot be null",
      });
    }

    if (!req.body.activity_group_id) {
      return res.status(400).json({
        status: "Bad Request",
        message: "activity_group_id cannot be null",
      });
    }

    let field = "title,activity_group_id,is_active,priority,status";
    let table = "todos";
    let value = `'${title}', ${activity_group_id}, ${is_active},'very-high','ok'`;
    const data = await db.create(table, field, value, "todo_id");
    return res.status(201).json({
      status: "Success",
      message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// // delete activity
app.delete("/todo-items/:todo_id", async (req, res) => {
  try {
    const { todo_id } = req.params;

    let field = "todo_id AS id,activity_group_id,title,is_active,priority";
    let table = "todos";
    let validateData = await db.findOne(table, field, todo_id, "todo_id");
    if (!validateData) {
      return res.status(404).json({
        status: "Not Found",
        message: `Todo with ID ${todo_id} Not Found`,
      });
    }

    await db.destroy(table, todo_id, "todo_id");

    res.status(200).json({
      status: "Success",
      message: "Success",
      data: {},
    });
  } catch (error) {
    console.log(error);
  }
});

// // update todo
app.patch("/todo-items/:todo_id", async (req, res) => {
  try {
    const { todo_id } = req.params;
    let {
      title,
      priority = "very-high",
      is_active = true,
      status = "ok",
    } = req.body;
    let field = "activity_group_id,title,is_active,priority,status";
    let table = "todos";
    let validateData = await db.findOne(table, field, todo_id, "todo_id");
    if (!validateData) {
      return res.status(404).json({
        status: "Not Found",
        message: `Todo with ID ${todo_id} Not Found`,
      });
    }

    if (!title) {
      title = validateData.title;
    }

    let value = `title = '${title}',priority = '${priority}',is_active = ${is_active},status = '${status}'`;

    const data = await db.update(table, field, todo_id, value, "todo_id");
    return res.json({
      status: "Success",
      message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// 404 endpoint middleware
app.all("*", (req, res) => {
  res.status(404).json({ message: `${req.originalUrl} not found!` });
});

// error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "An error occurred.",
  });
});

const run = async () => {
  await db.migration(); // 👈 running migration before server
  app.listen(port); // running server
  console.log(`Server run on http://${host}:${port}/`);
};

run();
