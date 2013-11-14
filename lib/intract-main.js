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

        /*
         * Simple query selector
         * USAGE:
         *       document.$("h2#heading")
         */
        window.HTMLDocument.prototype.$ = function(selectors) {
            return this.querySelectorAll(selectors);
        };

        // Find children of element using selectors
        window.HTMLElement.prototype.findChildren = function(selectors) {
            return this.querySelectorAll(selectors);
        };

        // Simple iterator
        helpers.each = function( collection, callback, scope ) {
            if ( typeof callback !== "function" ) throw "helpers.each: callback is required and must be a function"

            var size = collection.length;
            for ( i = 0; i < size; i++ ) {
                callback.call(scope || this, collection[i]);
            }

            return void 0;
        };

        // Array: contains? (include?)
        helpers.contains = function(arr, value) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === value) return true;
            }
            return false;
        };

        // Array: remove element by value
        helpers.arrayRemoveByValue = function( arr, value ) {
            var i = arr.length;
             while (i--) {
                if (arr[i] === value) arr.splice( i, 1 );
            }
            return arr;
        }
        
        // Array: remove element at index(s)
        helpers.arrayRemoveByIndex = function(arr, from, to) {
            var rest = arr.slice((to || from) + 1 || arr.length);
            arr.length = from < 0 ? arr.length + from : from;
            return arr.push.apply(arr, rest);
        };
        
        /*
         * Cross Browser helper to addEventListener.
         *
         * @param {HTMLElement} obj The Element to attach event to.
         * @param {string} evt The event that will trigger the binded function.
         * @param {function(event)} fnc The function to bind to the element. 
         * @return {boolean} true if it was successfuly binded.
         *
         * Reference: https://gist.github.com/eduardocereto/955642
         */
         helpers.addEventListener = function(obj, evt, fnc) {
             // Don't do events on text and comment nodes
             if ( obj.nodeType === 3 || obj.nodeType === 8 ) {
			           return;
		         }
            // W3C model
            if (obj.addEventListener) {
                obj.addEventListener(evt, fnc, false);
                return true;
            } 
            // Microsoft model
            else if (obj.attachEvent) {
                return obj.attachEvent('on' + evt, fnc);
            }
            // Browser don't support W3C or MSFT model, go on with traditional
            else {
                evt = 'on'+evt;
                if(typeof obj[evt] === 'function'){
                    // Object already has a function on traditional
                    // Let's wrap it with our own function inside another function
                    fnc = (function(f1,f2){
                        return function(){
                            f1.apply(this,arguments);
                            f2.apply(this,arguments);
                        }
                    })(obj[evt], fnc);
                }
                obj[evt] = fnc;
                return true;
            }
            return false;
        };

    }();

    // Cross-browser Remove Event Handler helper
    helpers.removeEventListener = function removeEventHandler(obj, evt, func) {
        if( obj.removeEventListener ) {
            obj.removeEventListener( evt, func, false);
            return true;
        }
        
        if( obj.detachEvent )
            return elem.detachEvent( 'on' + evt, func ); 
    };

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

    // Dynamic Templates
    bucket.templates = bucket.templates || {};
    bucket.templates = {
        chickletButtonView: function( targetEle, data, append ) {
            templ = "<div class='chickletButton'>"
                    +     "<div class='amount'>"
                    +     "$ "
                    +     parseFloat(data.amount)
                    +   "</div>"
                    + "</div>";

            var draw = function() {
              if ( append === true ) targetEle.appendChild(templ);
              else targetEle.innerHTML = templ;
            }();
        },
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
            // [ identifier, elements, event, function]

            initEvents = [
                [ 'chicklet:mouseover', bucket.chicklets, 'mouseover',
                  this.eventListeners.chickletMouseOver.bind(this)
                ],
                
            ];

            this.saveAndBindEvents( initEvents );

            // helpers.each( boundEvents, function( binder ) {
            //     helpers.each( binder[1], function( ele ){
            //         helpers.addEventListener(ele, binder[2], binder[3]);
            //     });
            // });
        },

        saveEvent: function( binder ) {
            log("saving event to eventListMap: " + binder[0]);

            // binder syntax: [ identifier, elements, event, function ]
            bucket.eventListMap =  bucket.eventListMap || {};
            // do: bucket.eventListMap[identifier] = [elements, event, function]
            bucket.eventListMap[binder[0]] = binder.slice(1);
            
            log(bucket, false);

            return true;
        },

        saveEvents: function( binders ){
            helpers.each( binders, function( binder ) {
                this.saveEvent( binder );
            }, this);
        },

        bindEvent: function( identifier ) {
            log("binding event: " + identifier);

            var binder = bucket.eventListMap[ identifier ];

            if( !binder ) return;

            // remove if already bound/registered
            var isAlreadyBound = helpers.contains( bucket.boundEvents || [], identifier );
            if( isAlreadyBound ) removeBoundEvent( identifier );

            // binder looks like: [ elements, event, function ]
            helpers.each( binder[0], function( ele ){
                helpers.addEventListener(ele, binder[1], binder[2]);
            });
            
            // add event to boundEvents list
            bucket.boundEvents = bucket.boundEvents || [];
            bucket.boundEvents.push( binder );

            log(bucket, false);
            
            return true;
        },

        bindEvents: function( identifiers ){
            helpers.each( identifiers, function( identifier ) {
                this.bindEvent( identifier );
            }, this);
        },

        saveAndBindEvent: function( binder ) {
            this.saveEvent( binder );
            this.bindEvent( binder[0] );
            return true;
        },

        saveAndBindEvents: function( binders ){
            helpers.each( binders, function( binder ) {
                this.saveAndBindEvent( binder );
            }, this);
        },

        removeBoundEvent: function( identifier ) {
            log("removing bound event: " + identifier);
            
             var isAlreadyBound = helpers.contains( bucket.boundEvents, identifier );

            if( !isAlreadyBound ) return;

            // remove from boundEvents list
            helpers.arrayRemoveByValue( identifier );

            binder = bucket.eventListMap[ identifier ];
            helpers.each( binder[0], function( ele ){
                helpers.removeEventListener(ele, binder[1], binder[2]);
            });

            log(bucket, false);

            return true;
        },
        
        removeBoundEvents: function( identifiers ){
            helpers.each( identifiers, function( identifier ) {
                this.removeBoundEvent( identifier );
            }, this);
        },

        clearEvent: function( identifier ) {
            // TODO
        },
        
        removeAndClearEvent: function( identifier ) {
          // TODO  
        },

        eventListeners: {
            chickletMouseOver: function(event) {
                var element = undefined;
                if ( event.srcElement ) element = event.srcElement;
                else if ( event.target ) element = event.target;
                log("hovered chicklet with pricetag: " + element.innerText);
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
            var chicklets = bucket['chicklets'] || [];
            helpers.each(chicklets, function( chicklet ){
                new bucket.templates.chickletButtonView( chicklet, {amount: 0}, false );
            });
            log("chicklet views initialized");
        }
    };

    window.Intract = payload;
    window.Intract.init();
    
})( window );
