

# eBay-A Simple Market Place Application
>An eBay Prototype

This project is an eBay prototype Simple Market Place with basic functionalities of User accounts, selling products and buying them. Bidding on them and winning the bids.

In order to checkout the thing, you better dive into it.

Please follow the instructions in order to access my application.


## Usage

* Make sure everything is set up.

Let's make sure that we have MySQL installed and ready to go on your machine. Follow this page to make sure that you have MySQL installed and running.

Now let's make sure to install Node.js and NPM, a package manager for Node.js and other JavaScript libraries.

You can find and download Node.js here where you will install NPM package manager alongwith the Node.js binaries.

Clone the code from Github.

```
git clone https://github.com/kalgibhatt/eBay-A-Simple-Market-Place-Application.git
```

Now go to directory and run cd command

Now we open SQL Queries for Simple Market Place.sql file from sql folder in any text editor of your choice to execute all the queries inside it sequentially to generate the database.

Now we will install all the JavaScript libraries.

```
npm install
```

Now add the folder logs to the application folder with mkdir.

Now open dao.js file from utils folder and change the below fields to appropriate values.

```
 host : "my_sql_server_ip_address",
 user : "my_sql_user_name",
 password: "my_sql_password",
 database : "simple_market_place",
 port: my_sql_port_number
```

Now start the server to start the application.

* Starting the server

To start the server, run below command

```
npm start
```

Now it will start the application by default on 0.0.0.0 IP address with 3000 port number.

Run the application at "http://localhost:3000/"

#Enjoy...........
