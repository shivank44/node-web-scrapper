const express = require("express");
const { Model } = require('objection');
require('dotenv').config();


const DomainController = require('./src/controllers/DomainController');

const app = express();
const port = process.env.PORT || 3000;

const knex = require('./database/knex');
Model.knex(knex);

//setting view engine to ejs
app.set("view engine", "ejs");

//route for index page
app.get("/", function (req, res) {
  res.render("index");
});

//route for domain page
//app.get("/domain", DomainController.getAll);

//route for domain page
app.get("/domain/:id", DomainController.getOne);

app.get("/crawl", DomainController.add);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});


app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});
