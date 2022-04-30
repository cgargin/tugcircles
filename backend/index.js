/* dependencies */
const express = require("express");

/*   config - express  */
const app = express();

/*  endpoint  - posts */
app.get("/posts", (request, response) => {
  let posts = [
    {
      caption: "Golden Gate Bridge",
      location: "Sanfransisco",
    },
    {
      caption: "Bosphorus",
      location: "Istanbul",
    },
  ];
  response.send(posts);
});

/* listen */
app.listen(process.env.PORT || 3000);
