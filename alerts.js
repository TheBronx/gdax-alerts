const gdaxClient = require('./gdax-client.js');
const _ = require('underscore');
const mailer = require('./mailer.js');
const conf = require('./config.json');

function alertNewFills(client, fills) {
  if (!fills || fills.length == 0) return;

  var phrases = _.map(fills, function(fill) {
    var operation = (fill.side === 'sell') ? 'sold' : 'bought';
    var products = fill.product_id.split('-');
    return 'You just ' + operation + ' <strong>' + fill.size.replace(/000+$/, '00') + '</strong> ' + products[0] +
            ' at <strong>' + fill.price.replace(/000+$/, '00') + '</strong> ' + products[1];
  });

  console.log('Sending mail to ' + client.email + '\n' + phrases);
  mailer.sendMail({
    to: client.email,
    subject: 'Gdax Alert',
    html: phrases.join('<br>')
  });
}

function alertForClient(client) {
  return new Promise((resolve, reject) => {
    gdaxClient.getNewFills(client)
      .then(fills => {
        alertNewFills(client, fills);
        resolve();
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

var promises = [];
for(var i=0; i<conf.clients.length; i++) {
  promises.push(alertForClient(conf.clients[i]));
}
Promise.all(promises).then(values => {
  //done
});
