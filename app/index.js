var generators = require('yeoman-generator');


module.exports = generators.Base.extend({
    paths: function () {
        console.log('the destination folder is:', this.destinationRoot());
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
            message: 'What\'s your Firebase endpoint? (ie: ' +
                'wilforge-generator.firebaseio.com)',
            default: 'wilforge-generator.firebaseio.com'
        }];

        this.prompt(prompts, function (answers) {
            this.appName = answers.name;
            this.firebaseEndpoint = answers.firebaseEndpoint;

            // Create configuration file.
            done();
        }.bind(this));
    },
    install: function () {
        //this.npmInstall();
        //this.bowerInstall();
    }
});
