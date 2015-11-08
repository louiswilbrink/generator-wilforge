# Wilforge Generator

This is a generator used to seed projects created by Wilforge Labs.  The generator provides server/client architecture using ExpressJS and Angular.  It also provides user management out of the box by using a Firebase endpoint, as well as simple email correspondence using the Mandrill API.

## Installation

`npm install -g generator-wilforge`

`yo wilforge`

The following prompts allow the generator to integrate with platform services.  You'll need to create accounts for these services.  Default endpoints have been created in order to demonstrate integrated services, but are throttled and should be replaced immediately.

1.) Firebase Endpoint (e.g my-new-app.firebaseio.com)
2.) Mandrill API Key

