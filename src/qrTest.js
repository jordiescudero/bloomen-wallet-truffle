var qrcode = require('qrcode-terminal');

qrcode.generate('someone sets it up', function (str) { 
    console.log(str);
});