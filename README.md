# Task Management Web Application

Web-based task management platform  with    user registration and login offers  a   user-friendly interface for categorizing  tasks under domains, creating new tasks, setting  reminders,      and searching for specific tasks within  domains; it also includes an alarm and desktop  notification system for reminders and helps users s       tay organized and complete tasks on time, ultimately leading to increased productivity and less stress.

## Tech Stack

**Client:** Express, Ejs.

**Server:** Node, Express,
MongoDB, Mongoose


## Packages / Dependencies

* "audic": "^3.0.1",
* "bcrypt": "^5.1.0",
* "body-parser": "^1.18.3",
* "dotenv": "^16.0.3",
* "ejs": "^3.1.8",
* "express": "^4.16.3",
* "express-session": "^1.17.3",
* "lodash": "^4.17.21",
* "md5": "^2.3.0",
* "moment": "^2.29.4",
* "mongoose": "^6.7.1",
* "mongoose-encryption": "^2.1.2",
* "mongoose-findorcreate": "^3.0.0",
* "netlify-lambda": "^2.0.15",
* "node-notifier": "^10.0.1",
* "passport": "^0.6.0",
* "passport-google-oauth20": "^2.0.0",
* "passport-local": "^1.0.0",
* "passport-local-mongoose": "^7.1.2",
* "play-sound": "^1.1.5",
* "serverless-http": "^3.1.0",
* "supergoose": "^0.0.2"

## Deployment

Website is live you can access it on:
[https://to-do-uzui.onrender.com/](https://to-do-uzui.onrender.com/)

First of all "node-js" is required.

I have used 18.14.2 version for this project.

You can install it from:
[Here](https://nodejs.org/en/)

To deploy this project run this project on your local enviroment you may download the zip file and extract everything from it .

Use any terminal and go to the project destinantion. 

Personally I prefer to use Hyper-Terminal.

As I recommend if you download as zip file and then extract it then you can directly copy paste the following command after completing the extraction of all files, to go to the project folder :


```bash
  cd downloads/"Work-Organizer-main"/"Work-Organizer-main"
```
If it does not work then simply paste the path where all the files of this particular project folder are present after 'doenloads/'


Then use the following command to install all the packages/ technologies used for this project:

```bash
    npm install 
    OR
    npm i
```
Finally run the following command and the Web Application will start running on the port:3000

```bash
  nodemon app.js
```
Hopefully if there are no erros then you will see the following message in your terminal/ console:

```bash
  Server has started successfully
```
Then go to your browser and head type
```bash
  localhost:3000
```
And see the project running.

----------------------------
### Demo Video
> Here is the link to what all you cna do in this task-management Web Application: [Demo-Video](https://drive.google.com/file/d/1LZsPh-tzExiCeMFpN3prAyMAlK-k_g09/view)
----------
## Possible Errors

If you find error that some module, somwhere insdie "node-modules" folder is not found, in your terminal after running:

```bash
  nodemon app.js
```

Then just open the project in your code editor and comment you the part where that module is required only if you dont see any errors after doing so.

If this command:

```bash
  nodemon app.js
```

Does not work then simply :

```bash
  npm i nodemon
```
And then agian run it.
