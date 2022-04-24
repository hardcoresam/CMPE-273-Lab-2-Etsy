# Etsy
## Prototype of Etsy application
 
### Steps to deploy the application

#### Setting up MongoDB

1. Clone this entire github repository into your machine and then install node.js, Kafka and Zookeeper in your system.
2. Create a cluster in Mongo Atlas and then create a database called as etsy.
3. Open "/backend/index.js" file and then update the mongoDbUrl based on your mongoDB atlas database credentials.

#### client
 
1. Open a terminal and then go to /client folder.
2. Execute "npm install" to install all the dependencies.
3. Update the "/client/src/components/util.js" backendServer variable value with the kafka server's IP address and port.
4. Create an AWS S3 bucket and then update all the S3 related config in the above mentioned file. This S3 bucket will be used to store all the images uploaded in the application.
5. You need to set up environment variables for your AWS Access Key and AWS Secret Access Key. Use the following names for these variables.
* REACT_APP_AWS_ACCESS_KEY_ID
* REACT_APP_AWS_SECRET_ACCESS_KEY
6. Execute "npm start" to run the front end server.

#### kafka
 
1. Open a terminal and then go to /kafka folder.
2. Execute "npm install" to install all the dependencies.
3. You need to setup a secret key for JWT to create tokens. You need to add this secret key as an environment variable with the following name.
* JWT_SECRET_KEY
4. Execute "npm start" to run the kafka server.

#### backend
 
1. Open a terminal and then go to /backend folder.
2. Execute "npm install" to install all the dependencies.
3. You need to setup a secret key for JWT to create tokens. You need to add this secret key as an environment variable with the following name.
* JWT_SECRET_KEY
4. Execute "npm start" to run the back end server.

#### Launch the application
 
1. Open the browser and navigate to Front end server's IP address with Port number (Eg: localhost:3000) to find the landing page.
