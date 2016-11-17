// var Reflux = require('reflux');

var RoomActions = Reflux.createActions([
    'fetchRooms',
    'fetchMeetingTypes',
    'fetchFacilities',
    'createRoom',
    'searchRooms',
    'updateRoom',
    'updateFilter',
    'resetFilter',
    'updateSearch',
    'applyFilter',
    'uploadRoomcsv',
    'notifyCsvUpload',
    'notifyAddNewRoom',
    'toggleView',
    'fetchBriefingTypes',
    'activateRoom',
    'bulkInactivateRooms',
    "notifyInactivateRooms",
    'fetchEventDetails',
    'fetchTags',
    'fetchFilters',
    'fetchOptions',
    'updateFilter',
    'syncCisBulkDownload'
]);



module.exports = RoomActions;
