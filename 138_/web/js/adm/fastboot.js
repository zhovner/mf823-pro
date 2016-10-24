/**
 * @module fastboot setting
 * @class fastboot setting
 */
define([ 'jquery', 'knockout', 'config/config', 'service' ],

function($, ko, config, service) {

    /**
     * system fastboot setting VM
     * @class FastbootSettingVM
     */
	function FastbootSettingVM() {
        var self = this;
        var info = getFastbootSetting();

        self.fastbootSetting = ko.observable(info.fastbootEnabled);

        self.save = function() {
            showLoading('operating');
            var params = {};
            params.fastbootEnabled = self.fastbootSetting();
            service.setFastbootSetting(params, function(result) {
                if (result.result == "success") {
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });

        };
    }

    /**
     * 获取fastboot 信息
     * @method getFastbootSetting
     */
    function getFastbootSetting() {
        return service.getFastbootSetting();
    }

    /**
     * 初始化FastbootSettingVM model
     * @method init
     */
	function init() {
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new FastbootSettingVM();
		ko.applyBindings(vm, container[0]);
        $('#fastbootSettingForm').validate({
            submitHandler : function() {
                vm.save();
            }
        });
	}

	return {
		init : init
	};
});