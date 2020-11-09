const path = require('path');
const jsdom = require('jsdom');
const express = require('express');
const app = express();
const server = require('http').Server(app);
// tutorial has the above line written as:
// const io = require('socket.io').listen(server);
// however, this broke the server
const io = require('socket.io')(server);

const Datauri = require('datauri');
const datauri = new Datauri();
const { JSDOM } = jsdom;


app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// server.listen(8081, function () {
//   console.log(`Listening on ${server.address().port}`);
// });


// ----- the below function launches phaser in the authoritative_server folder -----//


function setupAuthoritativePhaser() {
  JSDOM.fromFile(path.join(__dirname, 'authoritative_server/index.html'), {
    // To run the scripts in the html file
    runScripts: "dangerously",
    // Also load supported external resources
    resources: "usable",
    // So requestAnimatinFrame events fire
    pretendToBeVisual: true
  }).then((dom) => {
    //----- hte following code is meant to prevent a 'Uncought [TypeError: URL.createObjectURL is not a function]' error message from occuring -----//
    dom.window.URL.createObjectURL = (blob) => {
      if (blob){
        return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
      }
    };
    dom.window.URL.revokeObjectURL = (objectURL) => {};

    //----- the following code ensures that phaser has completely loaded on the server before attempting to launch the server -----//
    dom.window.gameLoaded = () => {
      dom.window.io = io;
      server.listen(8081, function () {
        console.log(`Listening on ${server.address().port}`);
      });
    };
  }).catch((error) => {
    console.log(error.message);
  });
}

setupAuthoritativePhaser();
