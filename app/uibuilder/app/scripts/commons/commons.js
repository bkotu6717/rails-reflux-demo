var Api = require('./api');

function Common() {

  function isLocalStorageEnabled() {
    var test = 'test';
    try {
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  var allowedEntriesInNumField = [8, 9];
  if ( /firefox/i.test(navigator.userAgent) ) {
    allowedEntriesInNumField = [8, 9, 37, 39];
  }

  function isEnabled(config) {
    return (config === 'true') || (config === 'yes') || (config === true);
  }

  function isNumberValid(ev, element) {
    /**
        allow only chars +-.0123456789
        for firefox: charCode is for checking number and
        keyCode 8 is for back button, 9 is for Horizontal tab,
        37 for left arraow and 39 for right arrow key (strictly for firefox)
        value regex: /(\+|-)?([0-9]+(\.[0-9]+)?)/
    */
    var value = "" + element.value;
    var keyPressed = ev.key || String.fromCharCode(ev.charCode);
    return (allowedEntriesInNumField.indexOf(ev.keyCode) !== -1) ||
            ( /(\+|-|[0-9]|\.)/.test(keyPressed)
                && !(value.length && isNaN(value.substr(0, element.selectionStart) + keyPressed + value.substr(element.selectionEnd) ) ) )
  }


  function isCookiedEnabled() {
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;
    if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
      document.cookie = "testcookie";
      cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
    }
    return (cookieEnabled);
  }

  function displayFileSize(bytes, precision) {
    precision = Number(precision) || 2;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return i18n.t('file_size', { size: 0, unit: i18n.t(sizes[0]) });
    }
    var indexUnit = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return i18n.t('file_size', { size: Math.round(Math.pow(10, precision) * bytes / Math.pow(1024, indexUnit), 2) / Math.pow(10, precision), unit: i18n.t(sizes[indexUnit]) });
  };

  this.displayFileSize = displayFileSize;

  function storeInLocalStorage(item, value) {
    window.localStorage.setItem(item, value);
  }


  function storeInCookieStorage(item, value) {
    document.cookie = item + "=" + value;
  }

  function getFromLocalStorage(item) {
    var returnValue = null;
    returnValue = window.localStorage.getItem(item);
    return returnValue == "undefined" || returnValue == null ? null : returnValue;
  }

  function getFromCookieStorage(item) {
    var name = item + "=";
    var returnValue = null;

    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        returnValue = c.substring(name.length, c.length);
      }
    }
    return returnValue == "undefined" || returnValue == null ? null : returnValue;
  }
  this.isNumberValid = isNumberValid;
  this.isEnabled = isEnabled;
  this.setItem = function(item, value) {
    var isSaved = true;
    if (isLocalStorageEnabled() == true) {
      storeInLocalStorage(item, value);
    } else if (isCookiedEnabled() == true) {
      storeInCookieStorage(item, value);
    } else {
      isSaved = false
    }
    return isSaved;
  }


  this.getItem = function(item) {
    var itemValue = null;

    if (isLocalStorageEnabled() == true) {
      itemValue = getFromLocalStorage(item);
    }

    if (!itemValue) {
      if (isCookiedEnabled() == true) {
        itemValue = getFromCookieStorage(item);
      }
    }

    return itemValue;
  }

  this.convertToTzone = function(date) {
    return moment(date).tz(envDetails.time_zone || "UTC").format('MM-DD-YYYY hh:mm A');
  }

  this.getTimeZone = function() {
    if (window.envDetails && window.envDetails.time_zone == undefined) {
      var originate = window.location.href.split('?')[1];
      var getData = originate ? originate.split("=")[1] : "";
      var promise = Api.fetch({
        url: Api.ENDPOINTS.time_zone_url,
        data: {
          originate: getData
        }
      });
      promise.done(function(data) {
        if (data.success) {
          envDetails.time_zone = data.time_zone;
        }
      });
    }
  }

  this.getFontSize = function(str, estdLettersPerTile) {
    var fontSize = 14;
    if (typeof str === "string") {
      estdLettersPerTile = Number(estdLettersPerTile) || 15;
      switch (Math.ceil(str.length / estdLettersPerTile)) {
        case 1:
          fontSize = 24;
          break;
        case 2:
          fontSize = 19;
          break;
        default:
          break;
      }
    }
    return fontSize;
  }

  this.alertLocationChange = function(){
    var key = 'cluuid';
    var cluuid = window.envDetails && envDetails.current_location_uuid;
    if(window.isEBCEvent && cluuid){
      var storedVal = this.getItem(key);
      var loc = window.envDetails.current_location && window.envDetails.current_location.name;
      if(storedVal && storedVal !== cluuid){
        setTimeout(function(){
          $('.notification-modal').first().notificationModal({
            class: 'blue',
            title: 'Location Change Info',
            body: 'You have been redirected to '+loc+', please use Company home to select different location.'
          });
        }, 2000);
      }
    }
    this.setItem('cluuid', cluuid);
  }

  this.initLocalStorage = function() {
    var tabElement = $('body').find('div[data-tab-store]');
    var toggleElement = $('body').find('ul[data-toggle-store]');

    $('body').on('shown.bs.tab', 'a[data-toggle="tab"]', function(e) {
      var anchor = $(e.currentTarget);
      var tabAppEl = anchor.closest('div[data-tab-store]');
      //Not writing to local storage if data-disable-store property is true.
      if (anchor.data('disable-store')) {
        return;
      }

      if (tabAppEl.length) {
        var key = tabAppEl.data('tab-store');
        this.setItem(key, anchor.attr('href'));
      }
    }.bind(this));

    $('body').find('ul.toggle-menu-list').on('click', 'a', function(e) {
      var anchor = $(e.currentTarget);
      var toggleAppEl = anchor.closest('ul[data-toggle-store]');

      if (toggleAppEl.length) {
        var key = toggleAppEl.data('toggle-store');
        this.setItem(key, anchor.data('switch-type'));
      }
    }.bind(this));

    if (toggleElement.length) {
      this.applySwitchState(toggleElement);
    }

    if (tabElement.length) {
      this.applyTabSelection(tabElement);
    }

    this.alertLocationChange();
  }

  this.applySwitchState = function(element) {
    var storageKey = element.data('toggle-store');
    var storeageVal = this.getItem(storageKey);
    if (storeageVal) {
      element.find('a[data-switch-type=' + storeageVal + ']').addClass('active');
    } else {
      element.find('a[data-switch-type]:first').addClass('active');
    }

  }

  this.applyTabSelection = function(elements) {
    elements.each(function(i, element) {
      var tabAppEl = $(element);
      var storageKey = tabAppEl.data('tab-store');
      var storeageVal = this.getItem(storageKey);
      var firstTabUl = tabAppEl.find('ul.nav-tabs').first();
      if (storeageVal) {
        firstTabUl.find('a[href=' + storeageVal + ']').tab('show');
      } 
      else {
        var index = (window.isEBCEvent && storageKey === "event-setting")? '1': '0';
        firstTabUl.find('a[data-toggle="tab"]:eq('+ index +')').tab('show');
      }
    }.bind(this));
  }

  this.clearItems = function() {
    if (isLocalStorageEnabled()) {
      window.localStorage.clear();
    }
  }

  this.redirectPage = function(target){
    if(envDetails.current_location_uuid){
      var separator = target.includes('?') ? '&': '?';
      if(!$.urlParam('current_location_uuid', target)){
        target = target + separator +'current_location_uuid='+ envDetails.current_location_uuid;
      }
    }
    window.location.href = target;
  }
}

module.exports = Common;