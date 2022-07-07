const express = require("express");
const bodyParser = require("body-parser");
var utf8 = require('utf8');

const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true }) ;

const itemsSchema=new mongoose.Schema({
  name:String
        });
const Item=mongoose.model("item",itemsSchema);

const item1=new Item({
  name:"item 1",
});

const item2=new Item({
  name:"item 2",
});

const item3=new Item({
  name:"item 3",
});

const defaultItems=[item1,item2,item3];

const listSchema={ name:String,
                  items:[itemsSchema]

};
const List=mongoose.model("list",listSchema);


app.get("/", function(req, res) {

  Item.find(function (err,foundItems) {

    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err) {
        if(err){
           console.log(err);
        }else{
           console.log("Successfully saved all the items to itemsDB");
        }
      });
     
      
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems}); 
    } 
  });
    
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });
  if (listName==="Today"){
                    item.save();
                    res.redirect("/");
  }else{
    List.findOne({name:listName},function (err,foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
      
    });

  }
  
});

app.post("/delete", function(req, res){
   const checkedItemId=req.body.checkbox;
   const listName=req.body.listName;
  
   if (listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err){
          console.log("Successfully deleted checked item");
          res.redirect("/");
      } 
    });
   }else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function (err,foundlist){
     if(!err){
       res.redirect("/"+listName);
     }

     });                          
    
   }

  
});

app.get('/:name',function(req, res){
  const listname=_.capitalize(req.params.name); 
  
  List.findOne({ name: listname }, function (err,foundlist) {
    if(!err){
      if(!foundlist){
        const list=new List({name:listname,
                             items:defaultItems
                            });
        list.save();
        res.redirect("/"+listname);
      }else{
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items}); 
      } 
   }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
