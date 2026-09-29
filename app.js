const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(()=>{
        console.log("coonected to db")
    })
    .catch((err)=>{
        console.log(err);
    })

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")))

app.get("/",(req,res)=>{
    res.send("root page")
})

//index route
app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({})
    res.render("listings/index.ejs",{allListings})
}))

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})

//show route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    res.render("listings/show.ejs",{listing})
}))

//create route
app.post("/listings",wrapAsync (async (req,res,next)=>{
    //let {title,description,image,price,location,country}=req.body;  //new.ejs mai jaake listing[] bana lo key value pair object jaisa
    // let listing = req.body.listing;
    if(!req.body.listing){
        throw new ExpressError(400,"sed valid data for listing");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save()
    res.redirect("/listings")
})
);

//edit route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
}))

//update route
app.put("/listings/:id",wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"sed valid data for listing");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`)
}))

//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletdListing = await Listing.findByIdAndDelete(id)
    res.redirect("/listings")
}))

// app.get("/testlisting",async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "calangute , goa",
//         country: "India"
//     })

//     await sampleListing.save();
//     console.log("sample was saveed");
//     res.send("test done")
// })

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"))
})

app.use((err, req, res, next) => {
    let { statusCode=500, message="Something Went Wtong"} = err;
    res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listening on port 8080")
})