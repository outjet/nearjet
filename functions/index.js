const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const axios = require('axios');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

exports.myFunction = functions.https.onRequest(async (req, res) => {
  try {
    const version = await client.accessSecretVersion({
      name: 'projects/134243935912/secrets/aeroapi',
    });
    const ohgoApiKey = version.payload.data.toString();
    cors(req, res, () => {
      const swLat = req.query.swLat;
      const swLon = req.query.swLon;
      const neLat = req.query.neLat;
      const neLon = req.query.neLon;
      // const apiUrl = `https://aeroapi.flightaware.com/aeroapi/flights/search?query=-latlong "${swLat} ${swLon} ${neLat} ${neLon}"`;
      const apiUrl = `https://aeroapi.flightaware.com/aeroapi/flights/search/advanced?query={true inAir} {range lat ${swLat} ${neLat}} {range lon ${swLon} ${neLon}}`;
      axios.get(apiUrl, {
        headers: {
          'x-apikey': `${aeroapi}`
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});
