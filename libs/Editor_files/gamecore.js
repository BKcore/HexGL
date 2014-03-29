/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * gamecore.js
 * Namespace wrappers and the base class
 */

window.gamecore = {};
gamecore.Class = $.Class;

/**
 * @class gamecore.Base
 * A base class providing logging, object counting and unique object id's
 * Examples:
 *
 * Unique ID and total objects:
 * <code>
 * var Fighter = gamecore.Base.extend('Fighter', {}, {});
 * var fighter1 = new Fighter();
 * var fighter2 = new Fighter();
 * fighter1.uniqueId;    // -> 'Fighter:0'
 * fighter2.uniqueId;    // -> 'Fighter:1'
 * Fighter.totalObjects; // -> 2
 * </code>
 *
 * Logging: (log, info, warn, error, debug)
 * <code>
 * fighter1.warn('oops'); // == console.log('Fighter:0 [WARN] oops');
 */

gamecore.Base = gamecore.Class('gamecore.Base',
    ///
    /// STATIC
    ///
    {
        totalObjects: 0,
        WARN: 'WARN',
        DEBUG: 'DEBUG',
        ERROR: 'ERROR',
        INFO: 'INFO',

        log: function(id, type, message)
        {
            var idString = '';
            if (id) idString = ':'+id;
            console.log(this.fullName + idString + ' [' + type + '] ' + message);
        },

        warn: function (message)
        {
            this.log(null, this.WARN, message);
        },

        debug: function (message)
        {
            this.log(null, this.DEBUG, message);
        },

        error: function (message)
        {
            this.log(null, this.ERROR, message);
        },

        info: function (message)
        {
            this.log(null, this.INFO, message);
        },

        assert: function(msg, condition)
        {
            if (!condition)
                throw msg;
        }

    },
    ///
    /// INSTANCE
    ///
    {
        objectId: 0,
        uniqueId: null,

        init: function()
        {
        },

        setup: function()
        {
            this.objectId = this.Class.totalObjects++;
            this.uniqueId = this.Class.fullName + ':' + this.objectId;
        },

        /**
         * @returns {String} A system-wide unique Id for this object instance
         */
        getUniqueId: function()
        {
            // if you see a null error here, then likely you have forgotten to call
            // this._super in a subclassed init method.
            return this.uniqueId;
        },

        /**
         * @returns {String} A hash matching this object. Override this to implement different
         * kinds of object hashing in derived classes.
         */
        hashCode: function()
        {
            return this.getUniqueId();
        },

        warn: function (message)
        {
            this.Class.log(this.objectId, this.Class.WARN, message);
        },
        debug: function (message)
        {
            this.Class.log(this.objectId, this.Class.DEBUG, message);
        },
        error: function (message)
        {
            this.Class.log(this.objectId, this.Class.ERROR, message);
        },
        info: function (message)
        {
            this.Class.log(this.objectId, this.Class.INFO, message);
        },

        toString: function()
        {
            return this.Class.fullName + ' [id: ' + this.objectId + ']';
        }
    });

