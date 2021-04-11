# serverautopsy

serverautopsy is your daily server monitoring middleware.

It is difficult to monitor how your current server in which your favourite apps are deployed.
If you are lazy like me then this is all you need. It checks your server's usage , memory and disk space and send mails to the admin via [Sendgrid](https://sendgrid.com/) to inform about the server if it's low on memory or disk or high cpu usage.

[Learn what is Sendgrid and how it works](https://sendgrid.com/).

## Installation

```sh
$ npm install serverautopsy
```

## API

```js
var serverAutopsy = require("server-autopsy");

app.use(
  serverAutopsy({
    "apiKey": SENDGRID_API_KEY,
    from: "test1@example.com",
    to: "test2@example.com",
  })
);
```
### serverAutopsy.json({object})
Server Autopsy is used as an middleware that takes an object to perform its task , we will now see inside the object

* **apiKey** - We will use sendgrid to send and recieve mails. We have to pass Sendgrid's api key here

* **from** - This would be admin's email of the sender

* **to** - Who would be recieving mails about our server's information

## Errors
If the devloper does not sent any of the required parameters it will throw "Api key or from mail or to mail not provided"

## License

[MIT](https://github.com/aknrg77/server-autopsy/blob/master/LICENSE)


