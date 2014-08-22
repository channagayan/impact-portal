# MifosX Client Impact Portal app

This is the  web application built on top of the MifosX platform for the mifos impact portal. It is a Single-Page App (SPA) written in web standard technologies like JavaScript, CSS and HTML5. It leverages common popular frameworks/libraries such as AngularJS, Bootstrap and Font Awesome.


Building from source
Note: Ensure you have npm installed - goto http://nodejs.org/download/ to download installer for your OS.
Clone impact portal repository to your local filesystem 
To download the dependencies, and be able to build, first install bower & grunt
npm install -g bower
npm install -g grunt-cli
Next pull the runtime and build time dependencies by running bower and npm install commands on the project root folder
bower install
npm install 
Adding associated tenants for each user
open users.txt file In the impact-portal/app folder using text editor
add associated tenants in JSON format
example: 
{"userName":"mifos", "tenants":[
{"tenant":"default"},
{"tenant":"internaldemo"}
]}
Save the file.
Build the code for production deployment. Execute the following command on root folder
grunt prod

To preview the app, run the following command on the project root folder
grunt serve
Default username/password: mifos/password. select the server by adding server address as parameter in browser address bar.
Example: baseApiUrl=https://localhost:8443&tenantIdentifier=default
You are done.



