var generators = require('yeoman-generator');
var esprima    = require('esprima');
var escodegen  = require('escodegen');
var fs         = require('fs');

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
            name: 'sessionSecret',
            message: 'Make up a session secret passphrase: ',
            default: 'keyboard cat'
        }];

        this.prompt(prompts, function (answers) {
            this.appName = answers.name;
            this.firebaseEndpoint = answers.firebaseEndpoint;
            this.sessionSecret = answers.sessionSecret;

            done();
        }.bind(this));
    },
    configuring: function () {
        // Create configuration file.
        console.log('Writing configuration file..');
        console.log('configuration - this.firebaseEndpoint', this.firebaseEndpoint);

        var srcCode = fs.readFileSync(__dirname + '/templates/config/configuration.js');
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
                }, this);
            }
        }, this);

        // Convert AST to file content string.
        var output = escodegen.generate(configAst);

        // Write to configuration.js, including user-provided platform creds.
        fs.writeFile(__dirname + '/templates/config/configuration.js', output, function (error) {
            if (error) {
                console.log('error writing configuration.js');
            }
            else {
                console.log('Successfully wrote configuration.js');
            }
        });
    },
    writing: {
        projectFiles: function () {
            var files   = this.expandFiles('**/*', { cwd: this.sourceRoot(), dot: true });
            var ignores = [
                '.git',
                '.gitignore',
                'README.md',
            ]; 

            files.forEach(function (file) {
                if (ignores.indexOf(file) !== -1) {
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
        //this.npmInstall();
        //this.bowerInstall();
    }
});
