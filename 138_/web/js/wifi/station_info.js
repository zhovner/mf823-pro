/**
 * station 模块
 * @module station
 * @class station
 */
define([ 'underscore', 'jquery', 'knockout', 'config/config', 'service' ], function (_, $, ko, config, service) {

    /**
     * stationViewModel
     * @class stationInfoVM
     */
    function stationInfoVM() {
        var self = this;
        var info = service.getCurrentlyAttachedDevicesInfo();
        self.deviceInfo = ko.observableArray(info.attachedDevices);
    }

    /**
     * 初始化ViewModel
     * @method init
     */
    function init() {
        $("#dropdownMain").show();
        $("#dropdownMainForGuest").hide();
        var container = $('#container')[0];
        ko.cleanNode(container);
        var vm = new stationInfoVM();
        ko.applyBindings(vm, container);
    }

    //addInterval(init,5000);

    return {
        init:init
    };
});