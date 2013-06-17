'use strict';

var theTextInput = document.getElementById('theTextInput');
var theStopButton = document.getElementById('theStopButton');

// Array of functions. Cheapo EventEmitter;
var onStop = [];
theStopButton.addEventListener('click', function (e) {
    for (var i = 0, n = onStop.length; i !== n; ++i) {
        onStop[i]();
    }
    onStop.length = 0;
});

function randInt(lo, hi) {
    return lo + Math.floor(Math.random() * (hi - lo));
}

function randChar() {
    var aCode = 'a'.charCodeAt(0);
    var zCode = 'z'.charCodeAt(0);
    return String.fromCharCode(randInt(aCode, zCode + 1));
}

function randChoice(arr) {
    return arr[randInt(0, arr.length)];
}

function withSelectionPreserved(textInput, f) {
    var oldStart = textInput.selectionStart;
    var oldEnd = textInput.selectionEnd;
    f();
    textInput.setSelectionRange(oldStart, oldEnd);
}


var doAction = (function () {
    function editTextInputValue(f) {
        // Helper to transform an operation `f` on strings to an operation
        // on a text input's value. Also provides the cursor location to
        // `f` and makes sure to preserve the selection.
        return function (theTextInput) {
            // Assume that selectionStart === selectionEnd. i.e. that there
            // is just a cursor.
            var loc = theTextInput.selectionStart;
            var newValue = f(theTextInput.value, loc);
            withSelectionPreserved(theTextInput, function () {
                theTextInput.value = newValue;
            });
        };
    }
    var addChar = editTextInputValue(function (s, loc) {
        return s.slice(0, loc) + randChar() + s.slice(loc);
    });
    function moveCursor(theTextInput) {
        var newCursorLoc = randInt(0, theTextInput.value.length);
        theTextInput.setSelectionRange(newCursorLoc, newCursorLoc);
    }
    var removeChar = editTextInputValue(function (s, loc) {
        return s.slice(0, loc) + s.slice(loc + 1);
    });
    var actions = runLengthDecode([
        [3, addChar],
        [3, removeChar],
        [1, moveCursor]
    ]);
    // [ [3, "foo"], ... ] -> ["foo", "foo", "foo", .... ]
    function runLengthDecode(arr) {
        var ret = [];
        for (var i = 0, n = arr.length; i !== n; ++i) {
            var runLength = arr[i][0];
            var value = arr[i][1];
            for (var j = 0; j !== runLength; ++j) {
                ret.push(value);
            }
        }
        return ret;
    }

    return function doAction(theTextInput) {
        randChoice(actions)(theTextInput);
    };
})();

function startInteraction() {
    var timeoutCookie;
    var stopped = false;
    onStop.push(function () {
        clearTimeout(timeoutCookie);
        stopped = true;
    });
    (function again() {
        doAction(theTextInput);
        if (!stopped) {
            timeoutCookie = setTimeout(again, 1000);
        }
    })();
}
startInteraction();

