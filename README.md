# TwoFactorAuth
How to add Two Factor Authentication easily to your working platfrom , using Nodejs and Angulajs.
A handy Module to be implemented in any web application to add a second layer of auth security .

### Front-end :
[AngularJS] ![alt tag](https://angularjs.org/img/AngularJS-small.png) :<http://angularjs.org> 1.8.x (bootstrap)
### Back-end :
[Nodejs]![alt tag](https://angularjs.org/img/AngularJS-small.png)
[express]
[MySql] even though [MongoDB] was easier to integrate with NodeJs but i wanted to try [Nodejs] with relational database
### Automation :
[Gulp] is my favorite javascript task runner that lets me automate tasks like

* Bundling and minifying libraries and stylesheets.
* Refreshing browser when i save files restart node server after modifying files.
* Quickly running unit tests
* Running code analysis
* Less/Sass to CSS compilation , Helped me for multilang especially
* Copying modified files to an output directory ,i could separate my source folder for public folder , all files on public are  generated from src



Here's what the project structure looks like:
* public
* -- css
* -- fonts
* -- js
* -- translations
* -- views
* server
* -- onetouch.js
* -- routes.js
* src
* -- css
* -- sass
* -- fonts
* -- js
* -- scripts
* -- translations
* -- views
* index.html
* server.js
* config.js
* gulpfile.js
* package.json






In case  you have some missing libs you can run ‘npm install‘ to install them, i have set properly package.json:


```sh

$ npm install

```

i have used bower for installing Angularjs libs and other front-end libs


Below I've included brief descriptions of the the workflow that have to do with user registration and authentication .




# Description :


- public  :  contains all front-end files
- js/app.js : contains all business code , controllers , services ,and calls to RESTful api  
- config.js : it contains database configuration ( username , password ,database , port ) that should be changed in order to   make the app working
- server/routes.js : all the server side api functions and the communication with database
- server/onetouch.js : to implement OneTouch in Two-Factor Authentication
- user_database.txt : mysql database export






the application can be built using the command :

```sh

$ gulp build

```
the application can be launched on the browser using :
```sh

$ gulp serve

```
i have added multilang  (AR , EN ) to support right-to-left and left-to-right languages using SASS and JSON file for each language , you can switch between languages in any view then the selected language will be injected .


Sign-up form is created and accessible from login form  
- Validation is done using Angular  and sanitisation using angular-sanitise module on the front-end to escape rendering no Trusted HTML tag , on the back-end i used sanitize node module .
- Checking if the user is already existing and show error message
- Passwords are hashed using ‘crypto’ node module , using a simple algorithm
- I create a table named ‘user’  contains all necessary fields for this test you find  user_database.txt  in the root folder

Sign-in form is created and accessible from different part :
- Validation and sanitisation
- Checking username and password using same hash

Two-factor Authentication to the sign-in using Authy (https://www.twilio.com/authy)
 automatically after check username and password correct app redirects user to  2FA form
with 2 options of Authentication , if Two-factor Authentication not yet enabled for the specific user ,thus will have to send country code , phone number , and email to subscribe to Authy then he will be redirected
- Authentication via SoftToken from Authy App :  form to perform Token Verification  


- Authentication using Authy OneTouch : the App sends a OneTouch request to user via Authy and receives an UUID approval  ,  Authy send notification one User approves to denies to /authy/callback  on my app with status = (approved/denied) the using socket and send notification to Font-End  .

[![Deploy to Openshift](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy) ,  the link to try it online <http://twofactor-jotun.rhcloud.com/>

## Extra : Implementation of InstantSearch

I have just implemented in fast way a simple Algolia InstantSearch  , to fetch JadoPado Products .


Thank You, it is was fun to integrate Two-factor Auth it is really super easy to implement and very interesting as solution to secure user Authentication
Please let me know if you deployed the app or there is any issue, i would like that you could test it .
