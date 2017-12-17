const conf = require('./config.json');

var mailgun = require('mailgun-js')({apiKey: conf.mail.apikey, domain: conf.mail.domain});

function sendMail(mail) {
  if (!conf.mail.enabled) return;

  var data = {
    from: mail.from || conf.mail.from,
    to: mail.to ||  conf.mail.to,
    subject: mail.subject || 'Gdax Alert',
    text: mail.text || null,
    html: mail.html || null
  };

  mailgun.messages().send(data, function (error, body) {
    if (error) return console.log(error);

    console.log(body);
  });
}

module.exports = {
  sendMail: sendMail
}
