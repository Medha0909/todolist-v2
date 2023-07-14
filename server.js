const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const port = process.env.PORT || 3000;
const server = express();

server.set('view engine', 'ejs');

server.use(bodyParser.urlencoded({
  extended: true
}));
server.use(express.static("public"))
server.use(express.static("views"))

// mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");
mongoose.connect("mongodb+srv://Medha:Medha800@cluster0.5cnxbpy.mongodb.net/todolistDB");

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

server.get("/", function(req, res) {
Item.find({}).then(function(foundItems,items){
  if(foundItems.length ===0){
    Item.insertMany(defaultItems).then(function(items){
      console.log("Successfully saved default items to DB.");
    })
    .catch(function(err){
      console.log(err);
    });
    res.redirect("/");
  }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});

server.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundList){
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    })
        .catch(function(err){
        console.log(err);
      });


});

server.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
  })
}
});

server.post("/delete",function(req,res){
  const checkedItemID= req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID).then(function(items){
      console.log("Successfully deleted checked items");
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemID}}}).then(function(foundList){
      res.redirect("/"+listName);
    });
  }
});

server.get("/about",function(req, res){
  res.render("about");
});

server.listen(port, function() {
  console.log("Server started on port "+port);
});
