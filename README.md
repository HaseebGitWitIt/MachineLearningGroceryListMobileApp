# SYSC 4907 - Group 1

# Crowd-source grocery store layouts for dynamically sorted shopping list

Create an app that rearranges your grocery list according to the layout of the grocery store in which you find yourself. The locations of different items within each store will be crowd-sourced. Use of appropriate mobile development tools to ensure cross-platform deployment is key. AWS or other online hosting services should be used for supporting the project. Machine learning (e.g. collaborative filtering) could be developed to guess the locations of items, if their location is known in other stores but not the current store. An online layout editor could also be created for roughly describing the physical location of different sections (produce, dairy, deli, bakery, etc).

## Familiarizing Yourself With The Project
- Read the Project Report: "\SYSC4907_Group1\Project report.docx"
- Watch the Project Demo Video: "\SYSC4907_Group1\Project Demo Video.m4v"

## Setting Up

### Needed Tools

#### On Your Computer:
- An IDE for developing in Javascript and Python. We recommend Visual Studio Code https://code.visualstudio.com/ with the Python and Javascript plugins.
- Python is needed for running the Python files and using Pip: https://www.python.org/
- Node is needed for using npm to install dependencies and running expo: https://nodejs.org/en/
- Git is needed for cloning the repo and pushing changes: https://git-scm.com/

#### Clone The Repo
- Clone the project repo from https://github.com/BramSrna/SYSC4907_Group1.git
- In your command prompt, go to the directory where you want to keep the project, and run "git clone https://github.com/BramSrna/SYSC4907_Group1.git"

#### In Your Browser:
##### Database Setup
- It is recommended that you make your own Firebase repository if you intend on changing the database structure or cloud functions, as you will not have access to the app's main database.
- This is not needed if you don't intend on making database changes (i.e. Your only changing the UI, only need to read from the DB, etc).

- To make a database, use Firebase https://firebase.google.com/
- Press "Go to console" in the top-right
- Press "Add Project"
- In your database, click "Database" in the left navigation bar
- Click "Create Database"
- Select "Start in production mode"
- Click "Next" then "Done"
- Click "Start Collection", then enter a Collection ID. On the next page, select Auto-ID and "Save"
- On the top of the page, there is a dropdown menu that says "Cloud Firestore". Select it and switch to "Realtime Database".
- In the triple-dot dropdown menu in the topo right, press import JSON. Then press "Browse" and select the "FIREBASE_INIT_INFO.json" from the cloned github repo.

- From the left sidebar, select "Authentication"
- Press "Set up sign-in method"
- Enable "Email/Password" and "Google"

- From the left sidebar, select the gear icon beside "Project Overview"
- At the bottom of the page, under "Your Apps", press the icon that looks like: "</>"
- Enter a nickname for the app and save the app.
- Under the "Your Apps" card, select the "Config" radio button.
- Copy the json, then in your IDE open "\SYSC4907_Group1\Application\components\FirebaseConfig.js" and replace that object with the one for your database.
- Also put the info in "\SYSC4907_Group1\gcf\main.py"

- From the left sidebar, select the gear icon beside "Project Overview"
- Select "Service Accounts"
- Make sure the "Node.js" radio button is selected
- Select "Generate new private key" and then "Generate Key"
- Set your computer's "GOOGLE_APPLICATION_CREDENTIALS" environment variable to the path to the file that was just downloaded.

##### Here Maps Setup
- This part is only necessary if you need to modify the Map interface for selecting stores.
- Create a Here Maps account https://www.here.com/products/mapping/map-data (Near the bottom of the page, press "Start Free Trial")
- Place the API key for your Here Maps account inside of your database under the "globals" table, with the name "hkey"

##### Spoonacular Setup
- This part is only necessary if you need to modify the Recipe interface for reading and saving recipes.
- Create a Spoonacular account https://spoonacular.com/
- Place the API key for your Spoonacular account inside of your database under the "globals" table, with the name "spoonacularApiKey"

#### On Your Phone:
- Download the Expo app from the Google Play Store https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en_CA or Apple App Store

#### Final Code Setup
All the following are done from your terminal.
- Go to "\SYSC4907_Group1\Application" and run "npm install"

Only do the following after you made your own database:
- Go to "\SYSC4907_Group1\Cloud Functions\functions" and run "firebase deploy"
- Go to "\SYSC4907_Group1\gcf" and run "gcloud functions deploy genRules --runtime python37 --trigger-http --allow-unauthenticated" and "gcloud functions deploy updateRules --trigger-event providers/google.firebase.database/eventTypes/ref.write --trigger-resource projects/_/instances/grocerylist-dd21a/refs/lists/{lid}/items --runtime python37 --allow-unauthenticated"

## Running the app
- In your terminal, go to "\SYSC4907_Group1\Application" and run "npm start"
- Wait for the QR code to appear in your terminal
- Open Expo and scan the QR code. The app will load and run on your phone. Shake your phone to open the dev menu once you scanned the code.

## Making Changes

### Making a PR
We used the following strategy when making PRs
- Write your code in a new personal branch
- After it's done, rebase your branch and make your Pull Request
- Assign reviewers if you want someone specific to review your commit
- Link the issue to the commit if applicable. Also move the card for the feature on the Kanban board to "up for review"
- Once you get your review and make any necessary changes, then merge the change

### Modifying cloud functions
If your modifying the cloud functions, we recommend you follow the following procedure:
- Create a copy of the original function with a different name
- Change the code to call your copied function
- Deploy your copied function
- When your function is complete, push your code
- After getting the necessary reviews, overwrite the old function with your new one and redploy the functions

The reason that we recommend this procedure is because pushing an overwrite, even if its on a personal branch, will change it for everyone, so it is good to wait until the change is complete before overwriting it.

### Pushing Cloud Functions
The following commands can be used to push cloud functions:

To push Javascript Cloud Functions:
- Go to "\SYSC4907_Group1\Cloud Functions\functions"
- Run "firebase deploy" to deploy all of the cloud function
- Run "firebase deploy --only functions:FUNCTION_NAME" to only deploy a function name FUNCTION_NAME
- Your function must be in "\SYSC4907_Group1\Cloud Functions\functions\index.js" to be deployed

To push Python Cloud Functions:
- Go to "\SYSC4907_Group1\gcf"
- Run "gcloud functions deploy FUNCTION_NAME --runtime python37 --trigger-http --allow-unauthenticated" to deploy HTTP-triggered functions
- Run "gcloud functions deploy updateRules --trigger-event TRIGGER_EVENT --trigger-resource DATABASE_TRIGGER_PATH --runtime python37 --allow-unauthenticated" to deploy database-write-triggered functions

