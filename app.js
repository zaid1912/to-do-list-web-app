const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const port = 3002;
const _ = require('lodash');
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/lodolistDB", {
  useNewUrlParser: true,
});

const { Schema } = mongoose;
const item = new Schema({
  name: {
    type: String,
    required: true,
  },
});
const Item = mongoose.model("Item", item);

const listSchema = {
    name: String,
    items: [item]
};

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your to-do list",
});

const item2 = new Item({
  name: "Hit the + to enter more items",
});

const item3 = new Item({
  name: "Let's get organised",
});

// Item.insertMany([item1, item2, item3]);

const defaultItems = [item1, item2, item3];
// var newitems = ["Buy Food", "Get Food", "Eat Food"];
// workItems =[];

app.set("view engine", "ejs");
app.use(express.static("public/css"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  var date = new Date();
  // var day = "";
  // if(date.getDay() === 6 || date.getDay() === 0){
  //     day = "weekend";

  //     // res.send('<h1>It is weekend</h1>');
  //     // res.sendFile(__dirname + "/index.html");
  // }

  // else{
  //     day = "weekday";
  //     // res.send("<h1>It is a week day. GO WORK!</h1>")
  // }
  // // console.log(day);
  // res.render("list", {kindOfDay: day});

  async function logItems() {
    const items = await Item.find({}, "name");
    if (items.length === 0) {
      Item.insertMany([item1, item2, item3]);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newitem: items });
    }
    // for(const item of items){
    //     console.log(item.name);
    // }
  }
  logItems();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  var day = date.toLocaleDateString("en-US", options);
});

app.post("/", function (req, res) {
 
  var itemName = req.body.newItem;
  const listName = req.body.list;
  
  const newItem = new Item({
    name: itemName,
  });
  if(listName === "Today"){
      newItem.save();
      res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then(function(foundList){
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
    })
  }

  console.log(req.body);
  // res.render("list", {newitem: newitem});
});

app.post("/delete", async function (req, res) {
    try {
      const listName = req.body.listName;
      const checkedItem = req.body.checkbox;
  
      if (listName === "Today") {
        await Item.findByIdAndRemove(checkedItem);
        res.redirect("/");
      } else {
        await List.findOneAndUpdate(
          { name: listName },
          { $pull: { items: { _id: checkedItem } } }
        );
        res.redirect("/" + listName);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      res.redirect("/");
    }
  });
  

app.get("/:custom", function(req, res){
    const customListname = _.capitalize(req.params.custom);

    
    List.findOne({ name: customListname })
    .then(foundList => {
        if (!foundList) {
        const list = new List({
            name: customListname,
            items: defaultItems
        })
        list.save();
        res.redirect("/" + customListname);
    //   console.log("List doesn't exist");
    } else {
        res.render("list", { listTitle: foundList.name, newitem: foundList.items});
    //   console.log(foundList);
    }
  })
  .catch(err => {
    console.error('Error finding list:', err);
  });

});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
