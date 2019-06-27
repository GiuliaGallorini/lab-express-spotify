const express = require("express");
const hbs = require("hbs");
// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

// Remember to insert your credentials here
const clientId = "6f594261b93e4945b95fa519fc9c9ac5";
const clientSecret = "6b42eef99ed146e0ae8d3efe91074c47";

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => {
    spotifyApi.setAccessToken(data.body["access_token"]);
  })
  .catch(error => {
    console.log("Something went wrong when retrieving an access token", error);
  });

// the routes go here:
app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/artists", (req, res, next) => {
  let search = req.query.search;
  console.log("TLC: search", search); // Shortcut: Ctrl+Alt+L or Ctrl+Alt+P > Turbo Console
  spotifyApi.searchArtists(search).then(data => {
      console.log("The received data from the API: ", data.body.artists.items);
      // .map( artist => artist.name)
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      res.render("artists", {
        search: search,
        artists: data.body.artists.items
      });
    })
    .catch(err => {
      console.log("The error while searching artists occurred: ", err);
    });
});


app.get('/albums/:artistId', (req, res, next) => {
  spotifyApi.getArtistAlbums(req.params.artistId).then(data => {
    // console.log("Artist albums", data.body.items[0]);
    let albums = data.body.items
    spotifyApi.getArtist(req.params.artistId).then(data => {
      // console.log(data.body)
      res.render("list-albums", {
      albums: albums,
      artistName: data.body.name
      });
    });
  });
});

app.get('/tracks/:trackId', (req, res, next) => {
  spotifyApi.getAlbumTracks(req.params.trackId).then(data => {
  // console.log("Tracks", data.body.items);
    res.render("list-tracks", {
      tracks: data.body.items
    });
  });
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
