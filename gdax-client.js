const fs = require('fs');
const Gdax = require('gdax');
const _ = require('underscore');
const conf = require('./config.json');

function getOrders(client) {
  var authedClient = new Gdax.AuthenticatedClient(client.key, client.b64secret, client.passphrase, conf.gdax.url);

  return new Promise((resolve, reject) => {
    authedClient.getOrders((err, response, orders) => {
      if (err) reject(err);
      else resolve(orders);
    });
  });
}

function getFills(client) {
  var authedClient = new Gdax.AuthenticatedClient(client.key, client.b64secret, client.passphrase, conf.gdax.url);

  return new Promise((resolve, reject) => {
    authedClient.getFills((err, response, fills) => {
      if (err) reject(err);
      else resolve(fills);
    });
  });
}

function errorResponse(fills) {
  if (typeof fills === 'string') return true; //it should be an array!
  return fills.length > 0 && typeof fills[0] === 'string'; //and it should contain objects
}

function getNewFills(client) {
  return new Promise((resolve, reject) => {
    var dbFills = [];
    try {
      dbFills = JSON.parse(fs.readFileSync(__dirname + '/db/' + client.key + '-fills.json', 'utf8'));
    } catch(err) {
      console.log('DB not found for user ' + client.email + '. Creating an empty one');
      saveFills(client, []);
    }

    getFills(client)
      .then((fills) => {
        if (errorResponse(fills)) {
          reject(new Error("Gdax API returned an error: " + fills));
        } else {
          fills = _.sortBy(fills, function(order) { return order.created_at; });
          var newFills = _.filter(fills, function(order) {
            var found = _.findWhere(dbFills, {order_id: order.order_id});
            return !found;
          });

          saveFills(client, fills);
          resolve(newFills);
        }
      })
      .catch(err => reject(err));
    });
}

function saveFills(client, fills) {
  fs.writeFileSync(__dirname + '/db/' + client.key + '-fills.json', JSON.stringify(fills));
}

module.exports = {
  getOrders: getOrders,
  getFills: getFills,
  getNewFills: getNewFills
};
