/**
 * @module wps
 * @class wps
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {

	/**
	 * WPS View Model
	 * @class WpsVM
	 */
	function WpsVM() {
        var self = this;
        var info = getWpsInfo();
        self.wpsType = ko.observable('');
        self.wpsPin = ko.observable('');
        //wps on/off
        self.wpsFlag = ko.observable(info.wpsFlag);
        self.authMode = ko.observable(info.authMode);
        //radio on/off
        self.radioFlag = ko.observable(info.radioFlag);
        self.encrypType = ko.observable(info.encrypType);
		self.hasMultiSSID=ko.observable(config.HAS_MULTI_SSID);
		
		
		self.mulOption = ko.observable(drawMulSSIDOption(info));
		
		self.wpsSSID = ko.observable(info.wpsSSID == info.multiSSID ? "SSID2" : "SSID1");

        self.save = function() {
            var info = getWpsInfo();
		
            if(info.radioFlag == '0') {
                showAlert('wps_wifi_off');
                return;
            }

            if(info.wpsFlag == '1') {
                showAlert('wps_on_info');
                return true;
            }

//            if(self.wpsSSID() == "SSID1") {
//                if(info.encrypType != "NONE" && info.encrypType != "AES" &&  info.encrypType != "CCMP"){
//                    showAlert('wps_auth_open');
//                    return ;
//                }
//            } else {
//                if(info.m_encrypType != "NONE" && info.m_encrypType != "AES" &&  info.m_encrypType != "CCMP"){
//                    showAlert('wps_auth_open');
//                    return ;
//                }
//            }
			
			var wpsSSID;
			if(self.wpsSSID() == "SSID1") {
                wpsSSID = info.ssid;
            } else {
                wpsSSID = info.multiSSID;
            }
			
			var basic=service.getWifiBasic();
			if(wpsSSID==basic.SSID){
				if(basic.broadcast=='1'){
					showAlert('wps_ssid_broadcast_disable');
                    return ;
				}
			}else if(wpsSSID==basic.m_SSID){
				if(basic.m_broadcast=='1'){
					showAlert('wps_ssid_broadcast_disable');
                    return ;
				}
			}

            showLoading('operating');
            var params = {};
            params.wpsType = self.wpsType();
            params.wpsPin = self.wpsPin();           
            params.wpsSSID = wpsSSID;
			
            service.openWps(params, function(result) {
                if (result.result == "success") {
                    self.wpsPin('');
                    clearValidateMsg();
                    successOverlay();
                } else {
                    errorOverlay();
                }
            });

        };
        
        if(info.wpsFlag != '0') {
           self.wpsType(info.wpsType == 'PIN' ? 'PIN' : 'PBC');
        }
        else {
            self.wpsType('');
        }
    }

    /**
     * 获取wps相关信息
     * @method getWpsInfo
     */
    function getWpsInfo() {
        return service.getWpsInfo();
    }
	
	/**
     * 获取wps相关信息
     * @method getWpsInfo
     */
	function drawMulSSIDOption(info) {
		var opts = [];
		opts.push(new Option(info.ssid, "SSID1"));
		if(info.ssidEnable == "1"){
			opts.push(new Option(info.multiSSID, "SSID2"));
		}			
		return opts;
	}

    /**
     * 初始化wps view model
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        $("#dropdownMainForGuest").hide();
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new WpsVM();
		ko.applyBindings(vm, container[0]);
		$('#wpsForm').validate({
			submitHandler : function() {
				vm.save();
			},
            rules: {
                txtPin: "wps_pin_length_check"
            }
		});

	}

	return {
		init : init
	};
});