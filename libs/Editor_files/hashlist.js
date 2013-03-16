
/**
 * A map of linked lists mapped by a string value
 */
gamecore.HashList = gamecore.Base.extend('gamecore.HashList',
    {},
    {
        hashtable: null,

        init: function()
        {
            this.hashtable = new gamecore.Hashtable();
        },

        add: function(key, object)
        {
            // find the list associated with this key and add the object to it
            var list = this.hashtable.get(key);
            if (list == null)
            {
                // no list associated with this key yet, so let's make one
                list = new pc.LinkedList();
                this.hashtable.put(key, list);
            }
            list.add(object);
        },

        remove: function(key, object)
        {
            var list = this.hashtable.get(key);
            if (list == null) throw "No list for a key in hashlist when removing";
            list.remove(object);
        },

        get: function(key)
        {
            return this.hashtable.get(key);
        }


    });
