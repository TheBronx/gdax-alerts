# gdax-alerts

## Configure and run
A simple script to send you an email whenever a pending order is complete.  
The email contains the size and price of the transaction.

Just edit the `config.json` file with your GDAX API credentials and also your Mailgun API key and domain. A free account is enough,
in fact you can use the sandbox environment of Mailgun if you just add your email to the *Authorized Recipients* list.

You can enter as many `clients` as you want. The example config contains two clients (Vitalik Buterin and Satoshi Nakamoto), you can leave
just one if you don't have more gdax accounts.

Once configured, run the script:  
`node alerts.js`

Or place the script in a CRON task and the first email will be sent with all your completed transactions. From now on, only new
operations will be notified. Enjoy!

## Contributing
PR are welcome.
