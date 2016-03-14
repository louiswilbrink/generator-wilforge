/******************************************************************************
 *
 * Author: Louis Wilbrink
 *
 * Notes: This file provides all server configuration values, along with 
 * platform/service credentials for the app.
 *
 * This includes database, email, payment, social, and other APIs.  Make sure
 * to keep this file safe, and only distribute it to trusted developers.  This
 * file should *never* be checked into the repository, and should be added to 
 * the .gitignore file.
 *
 * When `start.js` is launched, an environment variable is expected.  This can
 * be specified as an application parameter or an environment variable.  If
 * no value is provided, the default is `dev`.
 *
 *****************************************************************************/

var path = require('path');
var _    = require('lodash');

module.exports = {
    getConfig: function () {
        
        // Get environment.
        var environment = process.env.ENV || 'dev';

        // Use environment specific configuration values.
        var configuration = this[environment];

        // Convert all keys to camelCase.
        var configuration = _.mapKeys(configuration, function (value, key) {
            return _.camelCase(key);
        });

        return configuration;
    },
    dev: {
        // root directory is where `start.js` resides.
        'ROOT_DIR':                 path.normalize(__dirname + '/../'),
        'APP_NAME':                 '',
        'FIREBASE_ENDPOINT':        '',
        'MANDRILL_API_KEY':         '',
        'SERVER_EMAIL':             '',
        'SERVER_PASSWORD':          '',
        'INFO_EMAIL_ADDRESS':       '',
        'ENV':                      '',
        'DOMAIN':                   '',
        'PORT':                     '8080',
        'SESSION_SECRET':           ''
    },

    staging: {
        // root directory is where `start.js` resides.
        'ROOT_DIR':                 path.normalize(__dirname + '/../'),
        'APP_NAME':                 '',
        'FIREBASE_ENDPOINT':        '',
        'MANDRILL_API_KEY':         '',
        'SERVER_PASSWORD':          '',
        'SERVER_EMAIL':             '',
        'INFO_EMAIL_ADDRESS':       '',
        'ENV':                      '',
        'IP_ADDRESS':               '',
        'SUBDOMAIN':                '',
        'DOMAIN':                   '',
        'PORT':                     '8080',
    },

    production: {
        // root directory is where `start.js` resides.
        'ROOT_DIR':                 path.normalize(__dirname + '/../'),
        'APP_NAME':                 '',
        'FIREBASE_ENDPOINT':        '',
        'MANDRILL_API_KEY':         '',
        'SERVER_EMAIL':             '',
        'SERVER_PASSWORD':          '',
        'INFO_EMAIL_ADDRESS':       '',
        'ENV':                      '',
        'IP_ADDRESS':               '',
        'SUBDOMAIN':                '',
        'DOMAIN':                   '',
        'PORT':                     '443'
    }
};
