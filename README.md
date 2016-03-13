# Wilforge Generator

This is a generator used to seed projects created by Wilforge Labs.  The generator provides server/client architecture using ExpressJS and Angular.  It also provides user management out of the box by using a Firebase endpoint, as well as simple email correspondence using the Mandrill API.

## Getting Started

### Installation

`npm install -g generator-wilforge`

`yo wilforge`

The following prompts allow the generator to integrate with platform services.  You'll need to create accounts for these services.  Default endpoints have been created in order to demonstrate integrated services, but are throttled and should be replaced immediately.

1.) Firebase Endpoint (e.g my-new-app.firebaseio.com)

2.) Mandrill API Key

### Running the App

Once the generator is finished running, start the application using the following command:

`npm install`

`bower install`

`gulp serve`

## Dependencies

Routing, user management, email, and database capabilities come packaged in the source code contained in the `templates` folder.  This code is pulled in from a separate repository, [app-generator](https://github.com/louiswilbrink/app-generator).  The template folder is updated by performing a `git pull` command while in the `templates` folder.  This will be performed periodically by the maintainer, and avoids manual copying tasks and duplicate code.

