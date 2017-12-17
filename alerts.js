const fs = require('fs');
const Gdax = require('gdax');
const _ = require('underscore');
const mailer = require('./mailer.js');

const conf = require('./config.json');
var dbFills = require('./db/fills.json');

const authedClient = new Gdax.AuthenticatedClient(conf.gdax.key, conf.gdax.b64secret, conf.gdax.passphrase, conf.gdax.url);

function getOrders(allOrders) {
  if (!allOrders) allOrders = [];

  return new Promise((resolve, reject) => {
    authedClient.getOrders((err, response, orders) => {
      if (err) reject(err);
      else resolve(allOrders.concat(orders));
    });
  });
}

function getFills(allOrders) {
  if (!allOrders) allOrders = [];

  return new Promise((resolve, reject) => {
    authedClient.getFills((err, response, fills) => {
      if (err) reject(err);
      else resolve(allOrders.concat(fills));
    });
  });
}

function alertNewFills(fills) {
  if (!fills || fills.length == 0) return;

  var phrases = _.map(fills, function(fill) {
    var operation = fill.side === 'sell' ? 'sold' : 'bought';
    var products = fill.product_id.split('-');
    return 'You just ' + operation + ' <strong>' + fill.size.replace(/000+$/, '00') + '</strong>' + products[0] +
            ' at <strong>' + fill.price.replace(/000+$/, '00') + '</strong>' + products[1];
  });

  console.log(phrases);
  mailer.sendMail({
    subject: 'Gdax Alert',
    html: phrases.join('<br>')
  });
}

function saveFills(fills) {
  fs.writeFileSync(__dirname + '/db/fills.json', JSON.stringify(fills));
}

getFills()
  .then((allOrders) => {
    allOrders = _.sortBy(allOrders, function(order) { return order.created_at });
    var newFills = _.filter(allOrders, function(order) {
      var found = _.findWhere(dbFills, {order_id: order.order_id});
      return !found;
    });

    alertNewFills(newFills);
    saveFills(allOrders);
  })
  .catch(err => console.log(err));
