const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const axios = require('axios');

exports.myFunction = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const swLat = req.query.swLat;
    const swLon = req.query.swLon;
    const neLat = req.query.neLat;
    const neLon = req.query.neLon;
    // const apiUrl = `https://aeroapi.flightaware.com/aeroapi/flights/search?query=-latlong "${swLat} ${swLon} ${neLat} ${neLon}"`;
    const apiUrl = `https://aeroapi.flightaware.com/aeroapi/flights/search/advanced?query={true inAir} {range lat ${swLat} ${neLat}} {range lon ${swLon} ${neLon}}`;
    axios.get(apiUrl, {
      headers: {
        'x-apikey': 'L9oe2sg40TFLeWzSIKsvcyKffuu0wJBB'
      }
    })
      .then(response => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        console.log(res.getHeaders()); // log the response headers

        res.status(200).json(response.data);
      })
      .catch(error => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        console.log(res.getHeaders()); // log the response headers

        res.status(500).json({ error: error });
      });
  });
});
