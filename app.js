const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../WanderLust/models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("../WanderLust/init/utils/wrapAsync.js");
const ExpressError = require("../WanderLust/init/utils/ExpressError.js");
// const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js");

app.use(express.urlencoded({ extended: true }));




const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Database connection
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Routes
app.get("/", (req, res) => {
  res.send("Hey, I am root!");
});

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
}));

// New Route

app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});


// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing.price) listing.price = 0;
  res.render("listings/show.ejs", { listing });
}));

// Create Route
app.post("/listings",
  wrapAsync(async (req, res, next) => {
    // let {title,description,image,price,location,country} = req.body;
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

// Edit Route

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  console.log(deleteListing);
  res.redirect("/listings");
}));

// REVIEWS 
// Post Route

app.post("/listings/:id/reviews", async (req, res) => {
  try{
 let listing= await Listing.findById(req.params.id);
 let newReview = new Review (req.body.review);

 listing.reviews.push(newReview);

 await newReview.save();
 await listing.save();

 console.log("new review saved");
  res.redirect(`/listings/${listing._id}`); 
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).send("Something went wrong");
  }

});




// Sample listing test (optional)
// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     location: "Calangute, Goa",
//     country: "India",
//     price: 1200,
//   });
//   await sampleListing.save();
//   console.log("Sample was saved");
//   res.send("Successful testing");
// });

// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page not found!"));
// });



// app.use((err, req, res, next) => {
//   const statusCode = err.statusCode || 500; // default 500
//   const message = err.message || "Something went wrong"; // default message
//   res.status(statusCode).send(message);
// });

// Start server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
