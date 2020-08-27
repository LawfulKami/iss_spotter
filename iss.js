const request = require("request");

const fetchMyIP = () => new Promise((resolve, reject) => {
  request("https://api.ipify.org?format=json", (error, response, body) => {
    if (error) {
      reject(error);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      reject(Error(msg));
      return;
    }
    const ipObj = JSON.parse(body);
    resolve(ipObj.ip);
  });
});

const fetchCoordsByIp = ip => new Promise((resolve, reject) => {
  request(`https://ipvigilante.com/json/${ip}`, (error, response, body) => {
    if (error) {
      reject(error);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching Coords. Response: ${body}`;
      reject(Error(msg));
      return;
    }
    const coordsObj = JSON.parse(body);
    const finalObj = {};
    finalObj.latitude = coordsObj.data.latitude;
    finalObj.longitude = coordsObj.data.longitude;
    resolve(finalObj);
  });
});

const fetchISSFlyOverTimes = coords => new Promise((resolve, reject) => {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) {
      reject(error);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching Pass Times. Response: ${body}`;
      reject(Error(msg));
      return;
    }
    const passtimeObj = JSON.parse(body);
    const finalArr = passtimeObj.response;
    resolve(finalArr);
  });
});


/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */

const nextISSTimesForMyLocation = (callback) => {
  fetchMyIP()
    .then(ip => fetchCoordsByIp(ip))
    .then(coords => fetchISSFlyOverTimes(coords))
    .then(passTimes => {
      callback(null, passTimes);
    })
    .catch(error => {
      callback(error, null);
    });
};



module.exports = { nextISSTimesForMyLocation };

