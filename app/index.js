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
            name: 'name',
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
            name: 'mandrillApiKey',
            message: 'What\'s your Mandrill Api Key? ',
            default: 'keJof0bEYRH6hJopQBKRpw'
        }, {
            type: 'input',
            name: 'sessionSecret',
            message: 'Make up a session secret passphrase: ',
            default: 'keyboard cat'
        }];

        this.prompt(prompts, function (answers) {
            this.appName = answers.name;
            this.firebaseEndpoint = answers.firebaseEndpoint;
            this.firebaseSecret = answers.firebaseSecret;
            this.sessionSecret = answers.sessionSecret;
            this.mandrillApiKey = answers.mandrillApiKey;

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
                    if (property.key.value === 'FIREBASE_ENDPOINT') {
                        property.value.value = this.firebaseEndpoint;
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
            console.log('createUsersMap')
             
            // Create Firebase reference with user supplied endpoint.
            var ref = new Firebase(this.firebaseEndpoint);

            // Creating schema in firebase.
            ref.child('users').child('uid').set({
                email:    '_email',
                name:     '_name',
                address:  '_address',
                birthday: '_birthday',
                phone:    '_phone'
            });

            // Create server user.
            ref.createUser({
                email: 'server@' + this.appName + '.com',
                password: this.serverPassword
            }, function (error, userData) {
                if (error) {
                    console.log('There was an error creating server creds in Firebase', error);
                }
                else {
                    console.log('Created server user in Firebase:', userData);
                    this.serverUUID = userData.uid;
                }
            });
        }
        uploadRules: function () {
            console.log('uploadRules');

            // Replace dummy value for server UUID.
            fs.createReadStream('security-rules.json')
                .pipe(replaceStream('serverUUID', serverUUID))
                .pipe(process.stdout);

            // Upload new security rules to Firebase.
            fs.createReadStream('security-rules.json').pipe(request.put(this.firebaseEndpoint + '/.settings/rules.json?auth=' + this.firebaseSecret));
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
        this.npmInstall();
        this.bowerInstall();
    },
    end: function () {
        // Remove temp-configuration.js
        fs.unlink(__dirname + '/templates/config/temp-configuration.js', function (error) {
            if (error) {
                console.log('Error removing temp-configuration.js', error);
            }
        });
    }
});
