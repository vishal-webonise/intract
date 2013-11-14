console.log("before - from intract-main.js " + new Date); // REMOVE

var Intract = Intract || {};

(function ( window ) {
    
    /*------------------------------------------------------
     * Private
     *------------------------------------------------------
     */
    
    // #### Global Variable Setup ####

    var window = (window.inIF === true) ? parent.window : window; // are we in iFrame?
    var document = window.document;
    var debug = true; // false;
    var helpers = {};
    var bucket = {};

    // #### Cross-browser Support ####

    // Add Cross-browser support for some common properties
    var _xBrowser = function(){

        // IE < 8 support for - document.getElementsByClassName()
        if ( typeof document.getElementsByClassName  === "undefined" ) {
            document.getElementsByClassName = function(classname) {
                var arr = [];
                var regex = new RegExp('(^| )'+classname+'( |$)');
                var elmts = document.getElementsByTagName("*");
                for(var i=0,j=elmts.length; i<j; i++)
                    if(regex.test(elmts[i].className)) arr.push(elmts[i]);
                return arr;
            }
        }

        // IE < 8 support for - document.querySelectorAll()
        if (!document.querySelectorAll) {
            document.querySelectorAll = function (selectors) {
                var style = document.createElement('style'), elements = [], element;
                document.documentElement.firstChild.appendChild(style);
                document._qsa = [];

                style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
                window.scrollBy(0, 0);
                style.parentNode.removeChild(style);

                while (document._qsa.length) {
                    element = document._qsa.shift();
                    element.style.removeAttribute('x-qsa');
                    elements.push(element);
                }
                document._qsa = null;
                return elements;
            };
        }

    }();

     // #### Helpers ####

    // Add extra helper methods/properties
    var _helpers = function(){

        // Simple query selector
        // USAGE:
        //       document.$("h2#heading")
        window.HTMLDocument.prototype.$ = function(selectors) {
            return this.querySelectorAll(selectors);
        }

        // Find children of element using selectors
        window.HTMLElement.prototype.findChildren = function(selectors) {
            return this.querySelectorAll(selectors);
        }

        // Simple iterator
        helpers.each = function( collection, callback ) {
            if ( typeof callback !== "function" ) throw "helpers.each: callback is required and must be a function"

            var size = collection.length;
            for ( i = 0; i < size; i++ ) {
                callback( collection[i] );
            }

            return void 0;
        }

    }();

     // #### Private Functions ####

    // Simple Logger
    function log(msg, fancy) {
        if (debug) {
            if( typeof fancy === "undefined" ) { fancy = true };
            time = new Date().toLocaleTimeString();
            content = "[INTRACT] - " + time + " - " + msg;
            if( typeof console !== "undefined" && console !== null ) {
                return fancy ? console.log(content) : console.log(msg);
            }
            else {
                return void 0;
            }
        }
    }

    
    /*------------------------------------------------------
     * Public
     *------------------------------------------------------
     */
    
    payload = {
        init: function() {
            // PENDING
            this.locateChicklets();
            // if(chicklets.length <= 0){ 
            //     log("no chicklets found");
            //     return false;
            // }
            this.createChickletView();
            this.bindInitListeners();
        },
        
        // Enable debugging mode
        enDebug: function() {
            debug = true;
            // TODO(vishal): set cookie to store this
        },

        // Disable debugging mode
        disDebug: function() {
            debug = false;
            // TODO(vishal): set cookie to store this
        },

        bindInitListeners: function() {
            // chicklet mouseover
            for (var i = 0; i < bucket['chicklets'].length; i++) {
               bucket['chicklets'][i].addEventListener('mouseover', this.eventListeners.onChickletMouseOver.bind(this), false);
            }
            // chicklet mouseout
            // PENDING
        },

        eventListeners: {
            onChickletMouseOver: function(event) {
                var element = undefined;
                if ( event.srcElement ) element = event.srcElement;
                else if ( event.target ) element = event.target;
                log("hovered chicklet with pricetag: " + element.findChildren('.amount')[0].innerText);
            }
        },

        locateChicklets: function() {
            chicklets = document.getElementsByClassName('chicklet');
            this.updateBucket('chicklets', chicklets);
            log("chicklets on current page: " + chicklets.length);
            log(bucket, false);
            return chicklets;
        },
        
        updateBucket: function(key, value, override) {
            if( typeof override === "undefined" ) { override = false; }

            switch ( typeof bucket[key] ) {
                case "string":
                case "number":
                case "boolean":
                case "undefined":
                case "function":
                    bucket[key] = value;
                    break;
                case "object":
                    if( Array.isArray( bucket[key] ) ) {
                        override ? bucket[key] = value : bucket[key].push(value);
                    }
                    else {
                        // probably it's JSON object
                        bucket[key] = value; // TODO(vishal): need logic for merge/override
                    }
                    break;
                default:
                    bucket[key] = value;
            }
        },

        createChickletView: function() {
            if ( typeof bucket['chickletTemplate'] === "undefined" ) {
                bucket['chickletTemplate'] = "<div class='chickletButton'><div class='amount'>$ 0.00</div></div>";
            }
            var chicklets = bucket['chicklets'];
            helpers.each(chicklets, function( chicklet ){
                chicklet.innerHTML = bucket['chickletTemplate'];
            });
            log("chicklet views initialized");
        }
    };

    window.Intract = payload;
    window.Intract.init();
    
})( window );
