//jshint esversion:6
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { Schema } = mongoose;
const app = express();
const notifier = require('node-notifier');
const player = require('play-sound')(opts = {});
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.set('strictQuery', true);
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "My Secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://sairaj:Ryro92Jc@cluster0.ssmr9tj.mongodb.net/todolistDB", { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  uName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  items: [{
    type: Schema.Types.ObjectId,
    ref: "Item"
  }]
});

userSchema.plugin(passportLocalMongoose);
const secret = "Thisismysecret.";

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const itemsSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  _id: Schema.Types.ObjectId,
  name: { type: String, required: true },
  list: {
    type: Schema.Types.ObjectId,
    ref: "List"
  }
};
const Item = mongoose.model("Item", itemsSchema);

const tasksSchema = {
  _id: Schema.Types.ObjectId,
  listId: [{ type: Schema.Types.ObjectId, ref: 'List' }],
  name: String,
  time: String
};
const Task = mongoose.model("Task", tasksSchema);

const listSchema = {
  groupId: { type: Schema.Types.ObjectId, ref: 'Item' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  _id: Schema.Types.ObjectId,
  name: { type: String, required: true },
  tasks: [tasksSchema]
};
const List = mongoose.model("List", listSchema);



const item1 = new Item({
  name: "Welcome to your to-do list!"
});

const item2 = new Item({
  name: "Hit the + button to add new Group."
});

const item3 = new Item({
  name: "🡨 Hit this to delete the Group."
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  User.register({
    username: req.body.username,
    _id: new mongoose.Types.ObjectId(),
    uName: req.body.uName,
    email: req.body.username,
  }, req.body.password, function (err, newUser) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/welcome");
        app.get("/welcome", function (req, res) {
          if (req.isAuthenticated()) {
            res.render("welcome", { userName: newUser.uName });
          }
          else {
            res.redirect("/register");
          }
        });
      });
    }
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const Ouser = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(Ouser, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function (err) {
        if (req.isAuthenticated()) {
          User.findOne({ email: username }, function (err, foundUser) { 
            if (err) {
              console.log(err);
            } else {
              if (foundUser) {
                console.log(foundUser.username);
                console.log(foundUser._id);
                res.redirect("/list");
                app.get("/list", function (req, res) {
                  if(req.isAuthenticated()){
                    Item.find({ user: foundUser._id }, function (err, foundItems) {
                      console.log(foundItems);
                      res.render("list", { listTitle: "Group List", newListItems: foundItems });
                    });
                  } else {
                    notifier.notify({
                      title: 'Request Denied',
                      message: "You have been logged-out",
                      sound: true,
                      wait: true
                    });
                    res.redirect("/login");
                  } 
                });


                // APP.POST: adding item in the group list and tasks in that list
                app.post("/list", function (req, res) {
                  if (req.isAuthenticated()) {
                    const itemName = req.body.newItem;
                    const listName = req.body.list;
                    const item = new Item({
                      _id: new mongoose.Types.ObjectId(),
                      user: foundUser._id,
                      name: itemName
                    });
                    if (listName === "Group List" && item.user === foundUser._id) {
                      item.save(function (err) {
                        if (!err) {
                          res.redirect("/list");
                        }
                      });
                    }
                    else {
                      List.findOne({ name: listName, user: foundUser._id }, function (err, foundList) {
                        if (!err) {
                          if (foundList) {
                            const task = new Task({
                              user: foundUser._id,
                              _id: new mongoose.Types.ObjectId(),
                              listId: foundList._id,
                              name: itemName,
                              time: req.body.alarm
                            });
                            List.findById({ _id: foundList._id }, function (err, exists) {
                              if (!err) {
                                exists.tasks.push(task);
                                exists.save(function (err) {
                                  if (!err) {
                                    task.save(function (err) {
                                      if (!err) {
                                        console.log(task.time);
                                        res.redirect("/" + listName);
                                        runAlarms();
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        }
                      });
                    }
                  } else {
                    notifier.notify({
                      title: 'Request Denied',
                      message: "You have been logged-out",
                      sound: true,
                      wait: true
                    });
                    res.redirect("/login");
                  }
                });

                // Searching for task from main page
                app.post("/search-task", function (req, res) {
                  if (req.isAuthenticated()) {
                    const searchedTask = req.body.searchedTask;
                    // console.log(searchedTask); 
                    Task.findOne({ name: searchedTask, user: foundUser._id }, function (err, foundTask) {
                      if (!err) {
                        if (foundTask) {
                          console.log(foundTask);
                          List.findOne({ _id: foundTask.listId, user: foundUser._id }, function (err, foundGroup) {
                            if (!err) {
                              console.log(foundGroup);
                              notifier.notify({
                                title: 'Task Found',
                                message: "(" + searchedTask + ") task is in the (" + foundGroup.name + ") Group",
                                sound: true,
                                wait: true
                              });
                              res.redirect("/list");
                            }
                          });
                        } else {
                          notifier.notify({
                            title: 'NOT FOUND',
                            message: "The task (" + searchedTask + ") Does not exist",
                            sound: true,
                            wait: true
                          });
                          res.redirect("/list");
                        }
                      }
                    });
                  } else {
                    res.redirect("/login");
                    notifier.notify({
                      title: 'Request Denied',
                      message: "You have been logged-out",
                      sound: true,
                      wait: true
                    });
                  }
                });

                // Deleting by selecting checkbox.
                app.post("/delete-list", function (req, res) {
                  if (req.isAuthenticated()) {
                    const checkedItemId = req.body.checkbox;
                    const listName = req.body.listName;
                    if (listName === "Group List") {
                      Item.findByIdAndRemove(checkedItemId, function (err, foundedItem) {
                        if (!err) {
                          console.log("deleted the item");
                          List.findOneAndRemove({ groupId: checkedItemId }, function (err, founded) {
                            if (!founded || err) {
                              console.log('No list associated with the checked item');
                            } else {
                              Task.find({ listId: founded._id }, function (err, relatedTask) {
                                if (err || !relatedTask ) {
                                  console.log('No list associated with the checked item');
                                  res.redirect("/list");
                                } else {
                                  console.log(relatedTask);
                                  relatedTask.forEach(element => {
                                    element.deleteOne({ listId: founded._id }, function (err) {
                                      if (err) {
                                        console.log(err);
                                      }
                                      else {
                                        console.log("Deleted the tasks in selected group");
                                      }
                                    })
                                  });
                                }
                              });
                              console.log("Done");
                            }
                          });
                          res.redirect("/list");
                        }
                        else {
                          console.log(err);
                          res.redirect("/list");
                        }
                      });
                    }
                    else {
                      List.findOneAndUpdate({ name: listName }, { $pull: { tasks: { _id: checkedItemId } } }, function (err, foundList) {
                        if (!err) {
                          Task.deleteOne({ _id: checkedItemId }, function (err) {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log("Deleted the checked Item from Task collection also");
                              res.redirect("/" + listName);
                            }
                          });
                        }
                      });
                    }
                  } else {
                    res.redirect("/login");
                    notifier.notify({
                      title: 'Request Denied',
                      message: "You have been logged-out",
                      sound: true,
                      wait: true
                    });
                  }
                });

                app.get("/:anything", function (req, res) {
                  if (req.isAuthenticated()) {
                    const customListName = _.capitalize(req.params.anything);
                    List.findOne({ name: customListName, user: foundUser._id }, function (err, foundList) {
                      if (!err) {
                        if (!foundList) {
                          // Create new list
                          // console.log(req.query.itemId);
                          const list = new List({
                            user: foundUser._id,
                            _id: new mongoose.Types.ObjectId(),
                            name: customListName,
                            groupId: req.query.itemId
                          });
                          list.save();
                          res.redirect("/" + customListName);
                        }
                        else if (customListName === "Register" || customListName === "Login") {
                          const list = new List({
                            user: foundUser._id,
                            _id: new mongoose.Types.ObjectId(),
                            name: customListName,
                            groupId: req.query.itemId
                          });
                          list.save();
                          res.redirect("/" + customListName);
                        }
                        else {
                          // Show an existing list
                          res.render("task", { listTitle: foundList.name, newListItems: foundList.tasks });
                        }
                      }
                    });
                  } else {
                    res.redirect("/login");
                    notifier.notify({
                      title: 'Request Denied',
                      message: "You have been logged-out",
                      sound: true,
                      wait: true
                    });
                  }
                });

                async function ringBell() {

                }

                async function setAlarm(task) {
                  now = new Date();
                  alarmDate = new Date(task.time);
                  let timeToAlarm = alarmDate - now;
                  if (timeToAlarm >= 0) {
                    setTimeout(async () => {
                      console.log("Ringing now")
                      player.play('public/alert_siren.wav', function (err) {
                        if (err) {
                          console.log(err);
                        }
                      });
                      notifier.notify({
                        title: 'DO THE TASK',
                        message: `Time to do the "${task.name}" task`,
                      });
                    }, timeToAlarm);
                  }
                }

                async function runAlarms() {
                  const tasks = await Task.find({});
                  tasks.forEach(task => {
                    setAlarm(task);
                  });
                }
              }
            }
          });
        } else {
          notifier.notify({
            title: 'InValid Details',
            message: "Please provide correct details",
            sound: true,
            wait: true
          });
          res.redirect("/login")
        }

      });
    }
  });
});

app.post('/logout', function (req, res, next) {
  req.logOut(function (err) {
    if (err) { return next(err); }
    console.log("User logged-out")
    res.redirect('/');
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server has started successfully");
});
