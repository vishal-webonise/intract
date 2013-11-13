console.log("before - from intract-main.js " + new Date); // REMOVE

var Intract = Intract || {};

(function ( window ) {
    
    // Private
    
    // global variable setup
    var window = (window.inIF === true) ? parent.window : window;
    var document = window.document;
    var debug = true; // false;

    var bucket = {};

    // simple logger
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
    
    // Public
    
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
            if ( typeof bucket['chickletTemplate'] === "undefined" ) {
                bucket['chickletTemplate'] = "<div class='chickletButton'><div class='amount'>$ 0.00</div></div>";
            }
            var chicklets = bucket['chicklets'];
            for( i = 0; i < chicklets.length; i++ ) {
                chicklets[i].innerHTML = bucket['chickletTemplate'];
            }
            log("chicklet views initialized");
        }
    };

    window.Intract = payload;
    window.Intract.init();
    
})( window );
