var generators    = require('yeoman-generator');
var esprima       = require('esprima');
var escodegen     = require('escodegen');
var fs            = require('fs');
var request       = require('request');
var replaceStream = require('replaceStream');
var Firebase      = require('firebase');

module.exports = generators.Base.extend({
    paths: function () {
        console.log('the destination folder is:', this.destinationRoot());
    },
    prompting: function () {
        var done = this.async();

        var prompts = [{
            type: 'input',
            name: 'appName',
            message: 'What\'s the name of your project? ',
            default: 'myApp'
        }, {
            type: 'input',
            name: 'firebaseEndpoint',
            message: 'What\'s your Firebase endpoint? ',
            default: 'https://wilforge-generator.firebaseio.com'
        }, {
            type: 'input',
            name: 'firebaseSecret',
            message: 'What\'s your Firebase Secret Key? ',
            default: 'FTSLQUWZ5DEvWFtLRtFkbBodY0GtwPsSnjczz6Tl'
        }, {
            type: 'input',
            name: 'serverPassword',
            message: 'Set a password for the server\'s access to Firebase: ',
            default: 'any_password'
        }, {
            type: 'input',
            name: 'mandrillApiKey',
            message: 'What\'s your Mandrill Api Key? ',
            default: 'keJof0bEJIL6hJjqQBKRpw'
        }, {
            type: 'input',
            name: 'sessionSecret',
            message: 'Make up a session secret passphrase: ',
            default: 'keyboard cat'
        }, {
            type: 'input',
            name: 'adminEmail',
            message: 'Enter an email for the admin account: ',
            default: 'admin@mycompany.com'
        }];

        this.prompt(prompts, function (answers) {
            this.appName = answers.appName;
            this.firebaseEndpoint = answers.firebaseEndpoint;
            this.firebaseSecret = answers.firebaseSecret;
            this.serverPassword = answers.serverPassword;
            this.sessionSecret = answers.sessionSecret;
            this.mandrillApiKey = answers.mandrillApiKey;
            this.adminEmail = answers.adminEmail;

            done();
        }.bind(this));
    },
    configuring: function () {

        // Create configuration file.
        var srcCode = fs.readFileSync(__dirname + '/templates/config/empty-configuration.js');
        var configAst = esprima.parse(srcCode, { loc: false, comment: true });

        var module = configAst.body[2]['expression']['right']['properties'];

        module.forEach(function (element) {
            var key = element.key.name;
            // Access dev/staging/production environment objects.
            // This will skip module methods.
            if (key === 'dev' || key === 'staging' || key === 'production') {

                var properties = element.value.properties;

                properties.forEach(function (property) {
                    // Set firebase endpoint.
                    if (property.key.value === 'APP_NAME') {
                        property.value.value = this.appName;
                    }
                    if (property.key.value === 'FIREBASE_ENDPOINT') {
                        property.value.value = this.firebaseEndpoint;
                    }
                    if (property.key.value === 'SERVER_EMAIL') {
                        property.value.value = this.adminEmail;
                    }
                    if (property.key.value === 'SERVER_PASSWORD') {
                        property.value.value = this.serverPassword;
                    }
                    if (property.key.value === 'SESSION_SECRET') {
                        property.value.value = this.sessionSecret;
                    }
                    if (property.key.value === 'MANDRILL_API_KEY') {
                        property.value.value = this.mandrillApiKey;
                    }
                }, this);
            }
        }, this);

        // Convert AST to file content string.
        var output = escodegen.generate(configAst);

        // Write to configuration.js, including user-provided platform creds.
        fs.writeFileSync(__dirname + '/templates/config/temp-configuration.js', output);
    },
    writing: {
        createUsersMap: function () {
            var done = this.async();
             
            // Create Firebase reference with user supplied endpoint.
            var ref = new Firebase(this.firebaseEndpoint);

            // Create in-scope invocation context to use in the firebase callback.
            var _this = this;

            // Creating schema in firebase.
            ref.child('users').child('_uid').set({
                email:    '_email',
                name:     '_name',
                address:  '_address',
                birthday: '_birthday',
                phone:    '_phone'
            }, function (error) {
                if (error) {
                    console.log('Error setting users schema', error);
                }
                else {
                    console.log('wrote users schema to Firebase');
                }

                // Create server user.
                ref.createUser({
                    email: _this.adminEmail,
                    password: _this.serverPassword
                }, function (error, userData) {
                    if (error) {
                        console.log('There was an error creating server creds in Firebase', error);
                    }
                    else {
                        console.log('Created user in Firebase:', userData);

                        // Replace dummy value for server UUID.
                        fs.createReadStream(__dirname + '/security-rules.json')
                            .pipe(replaceStream('serverUUID', userData.uid))
                            // Write security rules to Firebase.
                            .pipe(request.put(_this.firebaseEndpoint + 
                                  '/.settings/rules.json?auth=' + 
                                  _this.firebaseSecret));
                    }

                    done();
                });
            });
        },
        projectFiles: function () {
            var files   = this.expandFiles('**/*', { cwd: this.sourceRoot(), dot: true });
            var ignores = [
                '.git',
                '.gitignore',
                'README.md',
                'config/empty-configuration.js'
            ]; 

            files.forEach(function (file) {
                if (ignores.indexOf(file) !== -1) {
                    return;
                }

                // Rename the temporary configuration file during copy.
                if (file === 'config/temp-configuration.js') {
                    this.fs.copyTpl(
                        this.templatePath(file),
                        this.destinationPath('config/configuration.js')
                    );
                    return;
                }

                this.fs.copyTpl(
                    this.templatePath(file),
                    this.destinationPath(file)
                );
            }, this);
        }
    },
    install: function () {
        console.log('installing npm and bower modules..');
        this.npmInstall();
        this.bowerInstall();

        var done = this.async();
        this.npmInstall('', function () {
            console.log('Installed all node packages');
            this.bowerInstall('', function () {
                console.log('Installed all bower packages');
                done();
            });
        })
    },
    end: function () {
        // Remove temp-configuration.js
        fs.unlink(__dirname + '/templates/config/temp-configuration.js', function (error) {
            if (error) {
                console.log('Error removing temp-configuration.js', error);
            }
        });

        console.log('all finished!');
    }
});
