/**
 * wifi advance 模块
 * @module wifi advance
 * @class wifi advance
 */
define([ 'underscore', 'jquery', 'knockout', 'config/config', 'service' ], function(_, $, ko, config, service) {

	/**
	 * 速率表
	 * @attribute {Array} modeRate 
	 */
	var modeRate = [0, 
	                1, 2, 5.5, 6, 6.5, 
	                9, 11, 12, 13, 18, 
	                19.5, 24, 26, 36, 39, 
	                48, 52, 54, 58.5, 65
	                ];

	/**
	 * 删除重复的速率
	 * @method unionArr
	 * @param {Array} arr 速率
	 */
	function unionArr(arr) {
		var rates = [], result = [];
		for ( var i = 0; i < arr.length; i++) {
			for ( var j = 0; j < arr[i].length; j++) {
				if (ko.utils.arrayIndexOf(rates, arr[i][j]) == -1) {
					rates.push(arr[i][j]);
					result.push({index: arr[i][j], rate: modeRate[arr[i][j]]});
				}
			}
		}
		result.sort(function(a, b) {
			return a.rate - b.rate;
		});
		return result;

	}

	/**
	 * 根据模式生成Options
	 * @method rateOption
	 * @param {String} mode 模式 mode in 0, 1, 2, 3, 4
	 */
	function rateOption(mode) {
		var rates = [];
		var modeB = [ 0, 1, 2, 3, 7 ];
		var modeG = [ 0, 4, 6, 8, 10, 12, 14, 16, 18 ];
		var modeN = [ 0, 5, 9, 11, 13, 15, 17, 19, 20 ];

		switch (mode) {
		case '0':
			rates.push(modeB);
			break;
		case '1':
			rates.push(modeG);
			break;
		case '2':
			rates.push(modeN);
			break;
		case '3':
			rates.push(modeB);
			rates.push(modeG);
			break;
		case '4':
			rates.push(modeB);
			rates.push(modeG);
			rates.push(modeN);
			break;
		default:
			rates.push(modeN);
			break;
		}
		var result = unionArr(rates);
		return drawRateOption(result);
	}

	function drawRateOption(data) {
		var opts = [];
		for ( var i = 0; i < data.length; i++) {
			var rate = data[i].rate == 0 ? "Auto" : data[i].rate + " Mbps";
			opts.push(new Option(rate, data[i].index));
		}
		return opts;
	}

	/**
	 * 根据国家生成相应的频道
	 * @method channelOption
	 * @param {String} country 国家码
	 */
	function channelOption(country) {
		var options = [ new Option('Auto', '0') ];
		var type = getCountryType(country) + '';
		switch (type) {
		case '1':
			addChannelOption(options, 2407, 11);
			break;
		case '3':
			addChannelOption(options, 2407, 11);
			addChannelOption(options, 2462, 2);
			break;
		case '7':
			addChannelOption(options, 2307, 13);
			addChannelOption(options, 2407, 11);
			addChannelOption(options, 2462, 2);
			break;
		default:
			addChannelOption(options, 2407, 11);
		}
		return options;
	}

    function channelOption5g(country){
        for(key in config.countryCode_5g){
            var item = config.countryCode_5g[key];
            if($.inArray(country, item.codes) != -1){
                return addChannelOption5g(item.channels);
            }
        }
        return [new Option('Auto', '0')];
    }

    function addChannelOption(options, start, count) {
        for ( var i = 1; i <= count; i++) {
            var txt = start + i * 5 + "MHz (Channel " + options.length + ")";
            options.push(new Option(txt, options.length + "_" + (start + i * 5)));
        }
    }

    function addChannelOption5g(channels) {
        var options = [new Option('Auto', '0')];
        for ( var i = 0; i < channels.length; i++) {
            var channel = channels[i];
            var mhz = 5000 + channel * 5;
            var txt = mhz + "MHz (Channel " + channel + ")";
            options.push(new Option(txt, channel + "_" + (mhz)));
        }
        return options;
    }
	
	function getBandOptions(){
		var options = [];
		options.push(new Option('2.4GHz', 'b'));
		options.push(new Option('5GHz', 'a'));
		return options;
	}
	
	function getChannelBandwidthsOptions(isSupport40){
		var options = [];
		if(isSupport40){
			options.push(new Option('20MHz', '0'));
			options.push(new Option('20MHz/40MHz', '1'));
		}else{
			options.push(new Option('20MHz', '0'));
		}
		return options;
	}
	
	/**
	 * 获取国家类型
	 * @method getCountryType
	 * @param {String} country 国家码
	 * @return {String} 类型
	 */
	function getCountryType(country) {
		var countryCode = config.countryCode;
		var type = '';
		for (key in countryCode) {
			var codes = countryCode[key];
			if ($.inArray(country, codes) != -1) {
				type = key;
				break;
			}
		}
		var typeCode = config.countryCodeType[type];
		return typeCode ? typeCode : "0";
	}

	function countryOption(is5G) {
		var countries = is5G ? config.countries_5g:config.countries;
		var options = [];
        for(key in countries){
            options.push(new Option(countries[key], key));
        }
        options = _.sortBy(options, function(opt){
            return opt.text;
        });
		return options;
	}

	function getWifiAdvance() {
		return service.getWifiAdvance();
	}

    function getWpsInfo() {
        return service.getWpsInfo();
    }
    
    function getModeOption(wifiBand){
    	var modes = config.NETWORK_MODES;
		 $("#mode").show();
		 $("#modeFor5HZ").hide();
    	if(wifiBand == 'a'){
    		modes = config.NETWORK_MODES_BAND;
		$("#modeFor5HZ").show();
		$("#mode").hide();
    	}
		var modeArr = [];
		for ( var i = 0; i < modes.length; i++) {
			modeArr.push(new Option(modes[i].name, modes[i].value));
		}
		return modeArr;
    }
    
    function getRateSelectedVal(rate, rates){
    	for(var i = 0; i < rates.length; i++){
    		var opt = rates[i];
    		if(opt.text == rate + " Mbps"){
    			return opt.value;
    		}
    	}
		return '0';
    }

	function getChannelSelectedVal(channel, channels){
		for(var i = 0; i < channels.length; i++){
			var opt = $(channels[i]);
			if(opt.val().split("_")[0] == channel){
				return opt.val();
			}
		}
		return '0';
	}

	/**
	 * WifiAdvanceViewModel
	 * @class WifiBasicViewModel
	 */
	function WifiAdvanceViewModel() {
		// Data
		var self = this;
		var wifiInfo = getWifiAdvance();
		self.modes = ko.observableArray(getModeOption(wifiInfo.wifiBand));
		self.bands = ko.observableArray(getBandOptions());
		
		var countryOpts = countryOption(wifiInfo.wifiBand == 'a');
		self.countries = ko.observableArray(countryOpts);
		self.channels = ko.observableArray(wifiInfo.wifiBand == 'a' ? channelOption5g(wifiInfo.countryCode) : channelOption(wifiInfo.countryCode));
		self.rates = ko.observableArray(rateOption(wifiInfo.mode));
		self.hasWifiBand = ko.observable(config.WIFI_BAND_SUPPORT);
		self.hasBandwidth = ko.observable(config.WIFI_BANDWIDTH_SUPPORT);
		
		// Init data
		self.selectedBand = ko.observable(wifiInfo.wifiBand);//5:a, 2.5:b
		self.selectedChannelBandwidth = ko.observable(wifiInfo.bandwidth);//5:a, 2.5:b
		self.selectedMode = ko.observable(wifiInfo.mode);
		self.selectedCountry = ko.observable(wifiInfo.countryCode.toUpperCase());
		self.selectedChannel = ko.observable(getChannelSelectedVal(wifiInfo.channel, self.channels()));
		self.selectedRate = ko.observable(getRateSelectedVal(wifiInfo.rate, self.rates()));
		
		self.channelBandwidths = ko.computed(function(){
			if(self.selectedMode() == '2' || self.selectedMode() == '4'){
				return getChannelBandwidthsOptions(true);
			} else {
				return getChannelBandwidthsOptions(false);
			}
		});
		
		wifiInfo = $.extend(wifiInfo, self);

		// //////////////////////Event Handler
		
		self.bandChangeHandler = function(){
			if(self.selectedBand() == 'a'){ //5g
				//802.11a only；802.11n only；802.11a/n 
				self.modes(getModeOption(self.selectedBand()));
                self.countries(countryOption(true));
			} else { // 2.4g
				//802.11 n only；802.11 b/g/n
				self.modes(getModeOption(self.selectedBand()));
                self.countries(countryOption(false));
			}
            self.selectedCountry('0');
            self.channels(self.generateChannelOption());
            self.selectedChannel('0');
		};
		
		/**
		 * 模式切换事件处理
		 * @event modeChangeHandler
		 */
		self.modeChangeHandler = function(data, event) {
			var opts = rateOption(self.selectedMode());
			self.rates(opts);
			self.selectedRate('0');
		};

		/**
		 * 国家切换事件处理
		 * @event countryChangeHandler
		 */
		self.countryChangeHandler = function(data, event) {
			var opts = self.generateChannelOption();//channelOption(self.selectedCountry());
			self.channels(opts);
			self.selectedChannel('0');
		};

        self.generateChannelOption = function(){
            if(self.selectedBand() == 'a'){
                return channelOption5g(self.selectedCountry());
            } else {
                return channelOption(self.selectedCountry());
            }
        };

		/**
		 * 保存修改
		 * @event save
		 */
		self.save = function() {
            var status = getWpsInfo();
            if(status.wpsFlag == '1') {
                showAlert('wps_on_info');
                return;
            }
            if(status.radioFlag == '0') {
                showAlert('wps_wifi_off');
                return;
            }
            var selectedRateTxt = $("#rate option:selected").text();
            var rateVal = null;
            if(selectedRateTxt == $.i18n.prop('rate_0')){
            	rateVal = 0;
            }else{
            	rateVal = $.trim(selectedRateTxt.replace('Mbps', ''));
            }
			showLoading('operating');
			var params = {};
			params.mode = self.selectedMode();
			params.countryCode = self.selectedCountry();
			var selectedChannel = self.selectedChannel();
			params.channel = selectedChannel == '0' ? '0' : selectedChannel.split("_")[0];
			params.rate = rateVal;//self.selectedRate();
			params.wifiBand = self.selectedBand();
			if(config.WIFI_BANDWIDTH_SUPPORT){
				params.bandwidth = self.selectedChannelBandwidth();
			}
			service.setWifiAdvance(params, function(result) {
				if (result.result == "success") {
					successOverlay();
				} else {
					errorOverlay();
				}
			});
			
		};
	}

	/**
	 * view model初始化
	 * @method init
	 */
	function init() {
        $("#dropdownMain").show();
        $("#dropdownMainForGuest").hide();
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new WifiAdvanceViewModel();
		ko.applyBindings(vm, container[0]);

        function checkWifiStatus() {
            var info = service.getAPStationBasic();
            if (info.ap_station_enable == "1") {
                $('#wifi_advance_form :input').each(function () {
                    $(this).attr("disabled", true);
                });
            } else {
                $('#wifi_advance_form :input').each(function () {
                    $(this).attr("disabled", false);
                });
            }
        }
        if(config.AP_STATION_SUPPORT){
            checkWifiStatus();
        }
        //clearTimer();
        //addInterval(checkWifiStatus, 1000);

		$('#wifi_advance_form').validate({
			submitHandler : function() {
				vm.save();
			}
		});
	}

	return {
		init : init
	};
});