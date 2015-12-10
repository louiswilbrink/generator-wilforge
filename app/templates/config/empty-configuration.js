var path = require('path');
var _ = require('lodash');
module.exports = {
    getConfig: function () {
        var environment = process.env.ENV || 'dev';
        var configuration = this[environment];
        var configuration = _.mapKeys(configuration, function (value, key) {
            return _.camelCase(key);
        });
        return configuration;
    },
    dev: {
        'ROOT_DIR': path.normalize(__dirname + '/../'),
        'APP_NAME': '',
        'FIREBASE_ENDPOINT': '',
        'MANDRILL_API_KEY': '',
        'SERVER_EMAIL': '',
        'SERVER_PASSWORD': '',
        'INFO_EMAIL_ADDRESS': '',
        'ENV': 'dev',
        'DOMAIN': 'localhost',
        'PORT': '8080',
        'SESSION_SECRET': ''
    },
    staging: {
        'ROOT_DIR': path.normalize(__dirname + '/../'),
        'APP_NAME': '',
        'FIREBASE_ENDPOINT': '',
        'SERVER_EMAIL': '',
        'SERVER_PASSWORD': '',
        'ENV': 'staging',
        'IP_ADDRESS': '',
        'SUBDOMAIN': 'staging',
        'DOMAIN': 'mydomain.com',
        'PORT': '80',
        'SESSION_SECRET': ''
    },
    production: {
        'ROOT_DIR': path.normalize(__dirname + '/../'),
        'APP_NAME': '',
        'FIREBASE_ENDPOINT': '',
        'SERVER_EMAIL': '',
        'SERVER_PASSWORD': '',
        'ENV': 'production',
        'IP_ADDRESS': '',
        'SUBDOMAIN': 'www',
        'DOMAIN': 'mydomain.com',
        'PORT': '443',
        'SESSION_SECRET': ''
    }
};
