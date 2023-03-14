const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const axios = require('axios');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

exports.myFunction = functions.https.onRequest((req, res) => {
  client.accessSecretVersion({
    name: 'projects/134243935912/secrets/aeroapi/versions/2',
  })
  .then(([version]) => {
    const aeroapikey = version.payload.data.toString();
    cors(req, res, () => {
      const swLat = req.query.swLat;
      const swLon = req.query.swLon;
      const neLat = req.query.neLat;
      const neLon = req.query.neLon;
      const apiUrl = `https://aeroapi.flightaware.com/aeroapi/flights/search/advanced?query={true inAir} {range lat ${Math.min(swLat, neLat)} ${Math.max(swLat, neLat)}} {range lon ${Math.min(swLon, neLon)} ${Math.max(swLon, neLon)}}`;
      axios.get(apiUrl, {
        headers: {
          'x-apikey': aeroapikey
        }
      })
      .then(response => {
        res.set('Access-Control-Allow-Origin', 'https://nearjet.web.app');
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        console.log(res.getHeaders()); // log the response headers
        const responseBody = {
          flights: response.data,
          composedUrl: apiUrl // Add the URL as a property of the response body
        };
        res.status(200).json(responseBody);
      })
      .catch(error => {
        res.set('Access-Control-Allow-Origin', 'https://nearjet.web.app');
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        console.log(res.getHeaders()); // log the response headers
        console.error(`Error in axios request to AeroAPI: ${error}`);
        res.status(500).json({ error: error });
      });
    });
  })
  .catch(error => {
    console.error(`Error in accessing AeroAPI secret: ${error}`);
    res.status(500).json({ error: error });
  });
});
