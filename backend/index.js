/* dependencies */
const express = require("express");
const admin = require("firebase-admin");
const busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
let UUID = require("uuid-v4");

/*   config - express  */
const app = express();

/* config firebase */
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "tugcircles.appspot.com",
});
const db = admin.firestore();
var bucket = admin.storage().bucket();

/*  endpoint  - posts */
app.get("/posts", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  let posts = [];
  db.collection("posts")
    .orderBy("date", "desc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
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

/*  endpoint  - createPost */
app.post("/createPost", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  let uuid = UUID();
  const bb = busboy({ headers: request.headers });
  let fields = {};
  let fileData = {};

  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    const filePath = path.join(os.tmpdir(), filename);
    file.pipe(fs.createWriteStream(filePath));
    fileData = { filePath, mimeType };
  });

  bb.on("field", (name, val, info) => {
    fields[name] = val;
  });

  bb.on("close", () => {
    bucket.upload(
      fileData.filePath,
      {
        uploadType: "media",
        metadata: {
          metadata: {
            contentType: fileData.mimeType,
            firebaseStorageDownloadTokens: uuid,
          },
        },
      },
      (err, uploadedFile) => {
        if (!err) {
          createDocument(uploadedFile);
        } else {
          console.log(err);
        }
      }
    );

    function createDocument(uploadedFile) {
      db.collection("posts")
        .doc(fields.id)
        .set({
          id: fields.id,
          caption: fields.caption,
          location: fields.location,
          date: parseInt(fields.date),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`,
        })
        .then(() => {
          response.send("Post Added:" + fields.id);
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
    }
  });

  request.pipe(bb);
  //Firebase Cloud functions da bu şöyle değişecek
  // bb.end(request.rawBody);

  // response.send(request.headers);
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
