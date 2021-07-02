# li-js

What is here?
  - small modifications to lit element in file li.js
  - components and apps created using li.js(lit element) in a folder li
  - useful components in a folder lib


You can view created components and various applications in li-tester component here: 

https://resu062.github.io/li-js/li/tester/

Or open single page applications:

TETRIS: https://resu062.github.io/li-js/li/tetris/

Exchange Rates (Курсы валют): https://resu062.github.io/li-js/li/valuta/

Credit Calculator (Кредитный калькулятор): https://resu062.github.io/li-js/li/credit-calc/

L-System: https://resu062.github.io/li-js/li/l-system/

Games of Life (canvas): https://resu062.github.io/li-js/li/life/

Games of Life (svg): https://resu062.github.io/li-js/li/life/

### Wiki (prototype): https://resu062.github.io/li-js/li/wiki/

Example of use Wiki as local server:

Download the archive (https://github.com/resu062/li-js/archive/refs/heads/master.zip) and unpack it to the required directory.

Use local-web-server (https://github.com/lwsjs/local-web-server)

In the terminal, enter the command: 
#### npm install -g local-web-server
on the unpacked folder, start the terminal and enter the command:
#### ws
or 
#### ws --qr
The answer would be like:
#### Listening on http://mbp.local:8000, http://127.0.0.1:8000, http://192.168.0.100:8000
The local server is running on the specified addresses.

If the command was with a key --qr, the QR code will be shown for launching on mobile devices.

You now have access to the wiki from any device on the local network.

To access from anywhere on the Internet, set up a VPN server at home.

I am using VPN server built-in in router Mikrotik.

The program uses a database PouchDB (https://pouchdb.com/) to store the input data on different devices, with subsequent synchronization when connected to a local network directly or via VPN.

For complete synchronization of all devices, you must install the CouchDB server locally (https://couchdb.apache.org/).

