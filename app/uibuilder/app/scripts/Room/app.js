initI18n(enLocale['room']);
var Handler = require('./handler');

$(document).ready(function(jQuery){
    Handler.init();
    setupUiI18n();
});
