/**
 * 选网模块
 * @module net_select
 * @class net_select
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

function($, ko, config, service, _) {
	
	var selectModes = _.map(config.AUTO_MODES, function(item) {
		return new Option(item.name, item.value);
	});

    /**
     * 选网功能view model
     * @class NetSelectVM
     */
	function NetSelectVM() {
		var self = this;
		
		var mf825 = false;
		var lte_band_1 = 0x1;
		var lte_band_3 = 0x4;
		var lte_band_7 = 0x40;
		var lte_band_8 = 0x80;
		var lte_band_20 = 0x80000;
		//var lte_band_38 = 0x2000000000;
		//var lte_band_40 = 0x8000000000;
		var lte_band_38_hi = mf825 ? 0x20 : 0x0;
		var lte_band_40_hi = mf825 ? 0x80 : 0x0;
		var lte_band_all = mf825 ? 0xA0000800C5 : 0x800C5;
		var umts_band_1 = 0x400000;
		var umts_band_8 = 0x2000000000000;
		var umts_band_8_hi = 0x20000;
		var umts_band_all = 0x2000000400000;
		var gsm_band_850 = 0x80000;
		var gsm_band_900 = 0x300;
		var gsm_band_1800 = 0x80;
		var gsm_band_1900 = 0x200000;
		var gsm_band_all = 0x280380;
		var umts_gsm_band_all = 0x2000000680380;

		var lte_mask_lo = 0;
		var lte_mask_hi = 0;
		var umts_mask_lo = 0;
		var umts_mask_hi = 0;

        //self.enableFlag = ko.observable(true);
        self.types = ko.observableArray(selectModes);
		self.selectedType = ko.observable();
		self.selectMode = ko.observable();
		self.networkList = ko.observableArray([]);
		self.selectNetwork = ko.observable('');

		self.islbset = ko.observable();
		self.islb1set = ko.observable();
		self.islb3set = ko.observable();
		self.islb7set = ko.observable();
		self.islb8set = ko.observable();
		self.islb20set = ko.observable();
		self.islb38set = ko.observable();
		self.islb40set = ko.observable();
		self.isubset = ko.observable();
		self.isub1set = ko.observable();
		self.isub8set = ko.observable();
		self.isgbset = ko.observable();
		self.isgb850set = ko.observable();
		self.isgb900set = ko.observable();
		self.isgb1800set = ko.observable();
		self.isgb1900set = ko.observable();
		self.tdd = ko.observable(mf825);

        self.networkStatus = function(data) {
            return $.i18n.prop(getNetworkStatus(data.nState));
        };

        self.networkStatusId = function(data) {
            return getNetworkStatus(data.nState);
        };

		self.networkText = function(data) {
			return data.strNumeric;
		};

        self.operatorName = function(data) {
            return data.strShortName;
        };

        self.networkType = function(data) {
            var result = getNetworkType(data.nRat);
            if(result == "auto")
                result = $.i18n.prop("auto");
            return result;
        };

        self.radioEnable = function(data){
            return data.radioEnabled;
        };

        self.networkTypeId = function(data) {
            return getNetworkType(data.nRat);
        };

		self.networkValue = function(data) {
			var result = [];
			//strNumeric
			result.push(data.strNumeric);
			//nRat
			result.push(data.nRat);
			
			return result.join(',');
		};
		
		self.setlball = function() {
            if (self.chkboxesDisable())
                return;
            var checkbox = $("#islbset:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.islbset("on");
                self.islb1set("on");
                self.islb3set("on");
                self.islb7set("on");
                self.islb8set("on");
                self.islb20set("on");
                self.islb38set("on");
                self.islb40set("on");
                lte_mask_lo = lte_band_all & 0xFFFFFFFF;
                lte_mask_hi = lte_band_38_hi | lte_band_40_hi;
            } else {
                self.islbset("off");
                self.islb1set("off");
                self.islb3set("off");
                self.islb7set("off");
                self.islb8set("off");
                self.islb20set("off");
                self.islb38set("off");
                self.islb40set("off");
                lte_mask_lo = 0;
                lte_mask_hi = 0;
            }
		}

		self.setlb1 = function() {
            if (self.chkboxesDisable())
                return;
            var checkbox = $("#islb1set:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.islb1set("on");
		        lte_mask_lo |= lte_band_1;
            } else {
                self.islb1set("off");
		        lte_mask_lo &= ~lte_band_1;
            }
            self.islbset(lte_mask_hi * 0x100000000 + lte_mask_lo == lte_band_all ? "on" : "off");
		}

		self.setlb3 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#islb3set:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.islb3set("on");
		        lte_mask_lo |= lte_band_3;
            } else {
                self.islb3set("off");
		        lte_mask_lo &= ~lte_band_3;
            }
            self.islbset(lte_mask_hi * 0x100000000 + lte_mask_lo == lte_band_all ? "on" : "off");
		}
		self.setlb7 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#islb7set:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.islb7set("on");
		        lte_mask_lo |= lte_band_7;
            } else {
                self.islb7set("off");
		        lte_mask_lo &= ~lte_band_7;
            }
            self.islbset(lte_mask_hi * 0x100000000 + lte_mask_lo == lte_band_all ? "on" : "off");
		};
		self.setlb8 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#islb8set:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.islb8set("on");
		        lte_mask_lo |= lte_band_8;
            } else {
                self.islb8set("off");
		        lte_mask_lo &= ~lte_band_8;
            }
            self.islbset(lte_mask_hi * 0x100000000 + lte_mask_lo == lte_band_all ? "on" : "off");
		};
		self.setlb20 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#islb20set:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.islb20set("on");
		        lte_mask_lo |= lte_band_20;
            } else {
                self.islb20set("off");
		        lte_mask_lo &= ~lte_band_20;
            }
            self.islbset(lte_mask_hi * 0x100000000 + lte_mask_lo == lte_band_all ? "on" : "off");
		};		
		self.setlb38 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#islb38set:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.islb38set("on");
		        lte_mask_hi |= lte_band_38_hi;
            } else {
                self.islb38set("off");
		        lte_mask_hi &= ~lte_band_38_hi;
            }
            self.islbset(lte_mask_hi * 0x100000000 + lte_mask_lo == lte_band_all ? "on" : "off");
		};				
		self.setlb40 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#islb40set:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.islb40set("on");
		        lte_mask_hi |= lte_band_40_hi;
            } else {
                self.islb40set("off");
		        lte_mask_hi &= ~lte_band_40_hi;
            }
            self.islbset(lte_mask_hi * 0x100000000 + lte_mask_lo == lte_band_all ? "on" : "off");
		};				

		self.setuball = function() {
            if (self.chkboxesDisable())
                return;
            var checkbox = $("#setubandall:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.isubset("on");
                self.isub1set("on");
                self.isub8set("on");
                umts_mask_lo |= umts_band_all;
                umts_mask_hi = umts_band_8_hi;
            } else {
                self.isubset("off");
                self.isub1set("off");
                self.isub8set("off");
                umts_mask_lo &= ~umts_band_all;
                umts_mask_hi = 0;
            }
		}
		self.setub1 = function() {
            if (self.chkboxesDisable())
                return;
            var checkbox = $("#setuband1:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.isub1set("on");
				umts_mask_lo |= umts_band_1;
            } else {
                self.isub1set("off");
		        umts_mask_lo &= ~umts_band_1;
            }
            self.isubset(((umts_mask_lo & umts_band_1) != 0) && ((umts_mask_hi & umts_band_8_hi) != 0) ? "on" : "off");
		}
		self.setub8 = function() {
            if (self.chkboxesDisable())
                return;
            var checkbox = $("#setuband8:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.isub8set("on");
				umts_mask_hi |= umts_band_8_hi;
            } else {
                self.isub8set("off");
		        umts_mask_hi &= ~umts_band_8_hi;
            }
            self.isubset(((umts_mask_lo & umts_band_1) != 0) && ((umts_mask_hi & umts_band_8_hi) != 0) ? "on" : "off");
		}

		self.setgball = function() {
            if (self.chkboxesDisable())
                return;
            var checkbox = $("#setgbandall:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.isgbset("on");
                self.isgb850set("on");
                self.isgb900set("on");
                self.isgb1800set("on");
                self.isgb1900set("on");
                umts_mask_lo |= gsm_band_all;
            } else {
                self.isgbset("off");
                self.isgb850set("off");
                self.isgb900set("off");
                self.isgb1800set("off");
                self.isgb1900set("off");
                umts_mask_lo &= ~gsm_band_all;
            }
		}
		self.setgb850 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#setgband850:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.isgb850set("on");
		        umts_mask_lo |= gsm_band_850;
            } else {
                self.isgb850set("off");
		        umts_mask_lo &= ~gsm_band_850;
            }
            self.isgbset((umts_mask_lo & gsm_band_all) == gsm_band_all ? "on" : "off");
		};		
		self.setgb900 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#setgband900:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.isgb900set("on");
		        umts_mask_lo |= gsm_band_900;
            } else {
                self.isgb900set("off");
		        umts_mask_lo &= ~gsm_band_900;
            }
            self.isgbset((umts_mask_lo & gsm_band_all) == gsm_band_all ? "on" : "off");
		};		
		self.setgb1800 = function() {
            if (self.chkboxesDisable())
                return;
			var checkbox = $("#setgband1800:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.isgb1800set("on");
		        umts_mask_lo |= gsm_band_1800;
            } else {
                self.isgb1800set("off");
		        umts_mask_lo &= ~gsm_band_1800;
            }
            self.isgbset((umts_mask_lo & gsm_band_all) == gsm_band_all ? "on" : "off");
		};		
		self.setgb1900 = function() {
            if (self.chkboxesDisable())
                return;
            var checkbox = $("#setgband1900:checked");
            if (checkbox && checkbox.length == 0 ) {
                self.isgb1900set("on");
		        umts_mask_lo |= gsm_band_1900;
            } else {
                self.isgb1900set("off");
		        umts_mask_lo &= ~gsm_band_1900;
            }
            self.isgbset((umts_mask_lo & gsm_band_all) == gsm_band_all ? "on" : "off");
		};		

        /**
         * 自动选网时设置网络模式
         * @method save
         */
		self.save = function() {
			
			showLoading('operating');
			
			var params = {};
			params.strBearerPreference = self.selectedType();

			var lte_mask = lte_mask_hi * 0x100000000 + lte_mask_lo
		    var bl = "0x" + lte_mask.toString(16);
			/*if (!mf825) {
				if (lte_mask == lte_band_all - lte_band_1) {
				    bl = "all";
				} else if (lte_mask == lte_band_1) {
				    bl = "2100M";
				} else if (lte_mask == lte_band_3) {
				    bl = "1800M";
				} else if (lte_mask == lte_band_7) {
				    bl = "2600M";
				} else if (lte_mask == lte_band_8) {
				    bl = "900M";
				} else if (lte_mask == lte_band_20) {
				    bl = "800M";
				}
			}*/
		    params.lte_band_lock = bl;
			
			var umts_mask = umts_mask_hi * 0x100000000 + umts_mask_lo
		    bl = "0x" + umts_mask.toString(16);
			/*if (!mf825) {
	            if (umts_mask == umts_gsm_band_all) {
				    bl = "PROLiNK_all";
				} else if (umts_mask == umts_band_1 + gsm_band_all) {
				    bl = "2100M";
				} else if (umts_mask == umts_band_8 + gsm_band_all) {
				    bl = "900M";
				}
			}
			if (getNetSelectInfo().wcdma_band_lock != "" || bl != "PROLiNK_all") {
				params.wcdma_band_lock = bl;
			}*/
			params.wcdma_band_lock = bl;

			service.setBearerPreference(params, function(result) {
				if (result.result == "success") {
                    self.networkList([]);
					successOverlay();
				} else {
					errorOverlay();
				}
			}); 
		};

        /**
         * 手动搜网
         * @method search
         */
		self.search = function() {
            self.initCtls();
			showLoading('searching_net');
            var status = service.getStatusInfo();
            var mccAndMnc = status.mdmMcc + "" + status.mdmMnc;
			service.scanForNetwork(function(result, networkList2) {
				hideLoading();
                var networkList = [];
                var mccmncs = ["25099","28301","28204","40101","43605","25502","25503","43404","43701"];
				if (result) {
                    if ($.inArray(mccAndMnc, mccmncs) != -1){
                    for(var i = 0 ; i < networkList2.length; i++){
                            networkList.push({
                                strShortName: networkList2[i].strShortName,
                                strNumeric: networkList2[i].strNumeric,
                                nRat: networkList2[i].nRat,
                                nState: networkList2[i].nState,
                                radioEnabled: $.inArray(networkList2[i].strNumeric,mccmncs) != -1? true : false
                            })
                        }
                    }else{
                        networkList = networkList2;
                    }
					self.networkList(networkList);
                    for (var i = 0; i < networkList.length; i++) {
                        var n = networkList[i];
                        if (n.nState == '2') {
                            self.selectNetwork(n.strNumeric + ',' + n.nRat);
                            return;
                        }
                    }
				} else {
					self.networkList([]);
				}
			});
		};

        /**
         * 注册选择的网络
         * @method register
         */
		self.register = function() {
			showLoading('registering_net');
			var networkToSet = self.selectNetwork().split(',');
			service.setNetwork(networkToSet[0], parseInt(networkToSet[1]), function(result) {
				if (result) {
					self.networkList([]);
					successOverlay();
                    var info2 = getNetSelectInfo();
                    self.selectedType(info2.net_select);
				} else {
					errorOverlay();
				}
			});
		};

        /*self.checkEnable = function() {
            var status = service.getStatusInfo();
            if (checkConnectedStatus(status.connectStatus) || status.connectStatus == "ppp_connecting") {
                self.enableFlag(false);
            }
            else {
                self.enableFlag(true);
            }
        };*/

        self.chkboxesDisable = function() {
            return !(self.selectMode() == "auto_select");
        };

		self.initCtls = function() {
	        var info = getNetSelectInfo();
			
	        self.selectedType(info.net_select);
	
			var lte_mask = lte_band_all;
			var bl = info.lte_band_lock;
			if (bl == "all" || bl == "PROLiNK_all" || bl == "") {
			    lte_mask = lte_band_all - lte_band_1;
			} else if (bl == "2100M") {
			    lte_mask = lte_band_1;
			} else if (bl == "1800M") {
			    lte_mask = lte_band_3;
			} else if (bl == "2600M") {
			    lte_mask = lte_band_7;
			} else if (bl == "900M") {
			    lte_mask = lte_band_8;
			} else if (bl == "800M") {
			    lte_mask = lte_band_20;
			} else {
			    var s = bl.substr(0,2);
			    if (s == "0x" || s == "0X")
				    lte_mask = parseInt(bl);
			}
			lte_mask_lo = lte_mask & 0xFFFFFFFF;
			lte_mask_hi = Math.floor(lte_mask / 0x100000000);
	        lte_mask_lo &= lte_band_all;
	        lte_mask_hi &= lte_band_38_hi | lte_band_40_hi;
	
			var umts_mask = umts_band_all;
			bl = info.wcdma_band_lock;
			if (bl == "PROLiNK_all" || bl == "") {
			    umts_mask = umts_gsm_band_all;
			} else if (bl == "2100M") {
			    umts_mask = umts_band_1 + gsm_band_all;
			} else if (bl == "900M") {
			    umts_mask = umts_band_8 + gsm_band_all;
			} else {
			    var s = bl.substr(0,2);
			    if (s == "0x" || s == "0X")
				    umts_mask = parseInt(bl);
			}
			umts_mask_lo = umts_mask & 0xFFFFFFFF;
			umts_mask_hi = Math.floor(umts_mask / 0x100000000);
	        umts_mask_lo &= umts_gsm_band_all;
	        umts_mask_hi &= umts_band_8_hi;
			
			self.islbset(lte_mask == lte_band_all ? "on" : "off");
			self.islb1set((lte_mask_lo & lte_band_1) != 0 ? "on" : "off");
			self.islb3set((lte_mask_lo & lte_band_3) != 0 ? "on" : "off");
			self.islb7set((lte_mask_lo & lte_band_7) != 0 ? "on" : "off");
			self.islb8set((lte_mask_lo & lte_band_8) != 0 ? "on" : "off");
			self.islb20set((lte_mask_lo & lte_band_20) != 0 ? "on" : "off");
			self.islb38set((lte_mask_hi & lte_band_38_hi) != 0 ? "on" : "off");
			self.islb40set((lte_mask_hi & lte_band_40_hi) != 0 ? "on" : "off");
			self.isubset(((umts_mask_lo & umts_band_1) != 0) && ((umts_mask_hi & umts_band_8_hi) != 0) ? "on" : "off");
			self.isub1set((umts_mask_lo & umts_band_1) != 0 ? "on" : "off");
			self.isub8set((umts_mask_hi & umts_band_8_hi) != 0 ? "on" : "off");
			self.isgbset((umts_mask_lo & gsm_band_all) == gsm_band_all ? "on" : "off");
			self.isgb850set((umts_mask_lo & gsm_band_850) != 0 ? "on" : "off");
			self.isgb900set((umts_mask_lo & gsm_band_900) != 0 ? "on" : "off");
			self.isgb1800set((umts_mask_lo & gsm_band_1800) != 0 ? "on" : "off");
			self.isgb1900set((umts_mask_lo & gsm_band_1900) != 0 ? "on" : "off");
		};
		
		//self.checkEnable();

        var info = getNetSelectInfo();
		
		if ("manual_select" == info.net_select_mode || "manual_select" == info.m_netselect_save){
			self.selectMode("manual_select");
		}
		else {
			self.selectMode("auto_select");
		}

        self.initCtls();
	}

    /**
     * 获取网络选择信息
     * @method getNetSelectInfo
     */
	function getNetSelectInfo() {
		return service.getNetSelectInfo();
	}

    /**
     * 搜网结果中的状态转换为对应的语言项
     * @method getNetworkStatus
     * @param {String} status
     * @return {String}
     */
	function getNetworkStatus(status) {
		if ("0" == status){		
			return "unknown";
		}else if ("1" == status){
			return "available";
		}else if ("2" == status){
			return "current";
		}else if ("3" == status){
			return "forbidden";
		}
	}

    /**
     * 网络类型转换
     * @method getNetworkType
     * @param {String} type
     * @return {String}
     */
	function getNetworkType(type)
	{
		if ("0" == type){
			return "2G";
		}else if ("2" == type){
			return "3G";
		}else if("7" == type){
            return "4G";
        }else{
			return "auto";
		}
	}

    /**
     * 初始化选网功能view model
     * @method init
     */
	function init() {
        $("#dropdownMain").show();
        $("#dropdownMainForGuest").hide();
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new NetSelectVM();
		ko.applyBindings(vm, container[0]);
		
		//addInterval( vm.checkEnable, 1000);
	}

	return {
		init : init
	};
});