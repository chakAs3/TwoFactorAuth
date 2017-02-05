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

[![alt tag](data:image/png;base64,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)](http://twofactor-jotun.rhcloud.com/) ,  the link to try it online <http://twofactor-jotun.rhcloud.com/>

## Extra : Implementation of InstantSearch

I have just implemented in fast way a simple Algolia InstantSearch  , to fetch JadoPado Products .


Thank You, it is was fun to integrate Two-factor Auth it is really super easy to implement and very interesting as solution to secure user Authentication
Please let me know if you deployed the app or there is any issue, i would like that you could test it .
