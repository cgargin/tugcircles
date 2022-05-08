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
const { request } = require("http");
const { response } = require("express");
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

/* endpoint - deletePost */
app.post("/deletePost", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const bb = busboy({ headers: request.headers });
  let fields = {};
  bb.on("field", (name, val, info) => {
    fields[name] = val;
  });
  bb.on("close", () => {
    let fName = fields.id + ".png";
    bucket
      .file(fName)
      .delete()
      .then((res) => {
        deleteDocument(fields.id);
      })
      .catch((err) => {
        console.log(err);
      });
    function deleteDocument(id) {
      db.collection("posts")
        .doc(id)
        .delete()
        .then(
          (res) => {
            console.log(res);
            response.send("Post Deleted:" + fields.id);
          },
          (err) => {
            console.log(err);
          }
        );
    }
  });
  request.pipe(bb);
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
          favCount: parseInt(fields.favCount),
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
app.post("/updatePost", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  const bb = busboy({ headers: request.headers });
  let fields = {};
  bb.on("field", (name, val, info) => {
    fields[name] = val;
  });
  bb.on("close", () => {
    db.collection("posts")
      .doc(fields.id)
      .set(
        {
          favCount: fields.favCount,
        },
        { merge: true }
      )
      .then((res) => {
        console.log(res);
        response.send("FavCount Updated", fields.id, fields.favCount);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  request.pipe(bb);
});

/* listen */
app.listen(process.env.PORT || 3000);
