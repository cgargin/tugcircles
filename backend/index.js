/* dependencies */
const express = require("express");
const admin = require("firebase-admin");

/*   config - express  */
const app = express();

/* config firebase */
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

/*  endpoint  - posts */
app.get("/posts", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  let posts = [];
  db.collection("posts")
    .orderBy("date", "desc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, "==>", doc.data());
        posts.push({
          id: doc.id,
          caption: doc.data().caption,
          location: doc.data().location,
          imageUrl: doc.data().imageUrl,
          date: doc.data().date,
          favCount: doc.data().favCount,
        });
      });
      response.send(posts);
    });
});

/* endpoint - update favCount */
// app.post(/posts/?)
// Create a document reference
// const cityRef = db.collection('cities').doc('BJ');

// Remove the 'capital' field from the document
// const res = await cityRef.update({
//   capital: FieldValue.delete()
// });

/*endpoint - delete a post */
// app.post('delete')
//const res = await db.collection('cities').doc('DC').delete();

/* listen */
app.listen(process.env.PORT || 3000);
