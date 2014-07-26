var lame = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');
var io = require('socket.io-client');
var uri = process.argv[2] || 'spotify:track:6tdp8sdXrXlPV6AZZN2PE8';

// Spotify credentials...
var username = 'YOUR USERNAME';
var password = 'YOUR PASSWORD';
var firstPlay = true;

Spotify.login(username, password, function (err, spotify) {
  if (err) throw err;
  var socket = io('http://localhost:6665');
    socket.on('connect', function(){
      if(firstPlay){
        socket.emit('getNextSong');
        firstPlay = false;
      }
      socket.on('nextSong', function(nextSong){
        console.log('the next song is: ', nextSong);

        // first get a "Track" instance from the track URI
        spotify.get(nextSong, function (err, track) {
          if (err) throw err;
          console.log('Playing: %s - %s', track.artist[0].name, track.name);

          // play() returns a readable stream of MP3 audio data
          track.play()
            .pipe(new lame.Decoder())
            .pipe(new Speaker())
            .on('finish', function () {
              console.log('song done, send me a new one');
              socket.emit('getNextSong');
            });

        });
      });
    });
});