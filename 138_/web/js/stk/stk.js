/**
 * setting--device seeting--USSD module
 * 
 * @module ussd
 * @class ussd
 */
define([ 'jquery', 'service', 'knockout'], function($, service, ko) {
	
	var menu_num_array = new Array();
	var menu_name_array = new Array();
	var input_str_array = new Array();
	var menu_name;
	var isPopuping=false;

    /**
     * @class STKInformationViewModel
     * @constructor
     */
	function StkInformationViewModel() {
		var self = this;
		self.STKInfo = ko.observable();
		self.menu_name_array_0 = ko.observable();
		self.stk_message_text = ko.observable();
		self.main_menu_infos = ko.observableArray();
		self.radio_select_submit_value = ko.observable("");
		self.child_menu_radio_value = ko.observable("");
		
		var main_menu_info_arr = [];
		push_menu_info = function(){
            main_menu_info_arr = [];
			for(k=0;k<menu_num_array[0];k++){
				i = k+1;
				var obj = {};
				obj.main_menu_value = stk_codeChange_main(menu_name_array[i]);
				obj.main_num_value = menu_num_array[i];
				main_menu_info_arr.push(obj);
			}
		};
		analyse_string = function(menu_name_str,i)
		{
			menu_num_array[i] = menu_name_str.substr(0,menu_name_str.indexOf(","));
			menu_name = menu_name_str.substr(menu_name_str.indexOf(",")+1);
			menu_name_array[i] = menu_name_str.substr(menu_name_str.indexOf(",")+1);
		};		
		
		stk_codeChange_main = function(str)
		{
			var len_str = str.length;
			var buffstr = str.substr(0,2);
			if(buffstr  == "80")
			{
				var new_str = str.substr(2,len_str);
				new_str = bytesToUnicode(new_str);
				return new_str;
			}
			else if(buffstr  == "81")
			{
				var new_str = str.substr(2,len_str);
				new_str = bytesToUCS(new_str);
				return new_str;
			}
			else
			{
				var str=decoding_ASCII(str);
				return str;
			}
		};	

		bytesToUCS = function(bs)
		{
			var result = "";
			if(bs=="" || bs==null)
			return result;
			var reallen = 2*parseInt(bs.substr(0,2),16);
			var bptr = parseInt(bs.substr(2,2),16) << 7;
			for(var i=4; i<reallen+4; i+=2)
			{
				var subbs = bs.substring(i, i+2);
				var subbs_int = parseInt(subbs,16);
				if((subbs_int & 0x80) == 0)
				{
				result += String.fromCharCode(subbs_int);
				}
				else
				{
				subbs_int = (subbs_int & 0x7F) + bptr;
				result += String.fromCharCode(subbs_int);
				}
			}
			return result;
		};		
		
		bytesToUnicode = function(bs)
		{
			var result = "";
			if(bs=="" || bs==null)
			return result;
			for(var i=0; i<bs.length; i+=4)
			{
				var subbs = bs.substring(i, i+4);
				var subbs_int = parseInt(subbs,16);
				result += String.fromCharCode(subbs_int);
			}
			return result;
		};				
		
		decoding_ASCII = function(num_string)
		{
			var subbs = "";
			var subbs_int = "";
			var result = "";
			for(var i=0; i<num_string.length; i+=2) 
			{ 
				subbs = num_string.substring(i, i+2);
				subbs_int = parseInt(subbs,16);
				result+=String.fromCharCode(subbs_int);
			} 
				return result;
		};	
	
		self.select_main_menu = function(main_menu_info)
		{
			page_num_submit = main_menu_info.main_num_value;
			showLoading();
			var params = {};
			params.operator = "stk_menu";
			params.item_no = page_num_submit;
			service.setSTKMenuInfo(params, function(result) {
				hideLoading();
				if (result.result == "success") {
					loadSTKWriteFlag();
				} else {
					errorOverlay();
				}
			});
		};
		
		select_main_menu_radio = function()
		{
			if(self.radio_select_submit_value() == "")
			return;
			showLoading();
			var params = {};
			params.operator = "stk_menu";
			params.item_no = self.radio_select_submit_value();
			service.setSTKMenuInfo(params, function(result) {
				hideLoading();
				if (result.result == "success") {
					loadSTKWriteFlag();
				} else {
					errorOverlay();
				}
			});
		};
		
		stk_codeChange_text = function(value_stk){
			var stk_message_text = value_stk;
			var len_str = stk_message_text.length;
			var buffstr = stk_message_text.substr(2,2);

			if(buffstr  == "80")
			{
				var new_str = stk_message_text.substr(4,len_str-4);
				new_str = bytesToUnicode(''+new_str+'');
				return new_str;
			}
			else
			{
				len_str = str.length;
				new_str = str.substr(2,len_str-2);	
				var new_str=decoding_ASCII(''+new_str+'');
				return new_str;
			}
		};
		
		submit_text = function(){
			showLoading();
			var params = {};
			params.operator = "stk_text";	
			service.setSTKMenuInfo(params, function(result) {
				hideLoading();
				if (result.result == "success") {
					loadSTKWriteFlag();
				} else {
					errorOverlay();
				}
			});
		};	
				
		back_submit_button = function(){
			showLoading();
			var params = {};
			params.operator = "stk_back";	
			service.setSTKMenuInfo(params, function(result) {
				hideLoading();
				if (result.result == "success") {
					loadSTKWriteFlag();
				} else {
					errorOverlay();
				}
			});
		};			

		cut_down_number = function(value_stk){
			var string = value_stk.toString();
			var i = 0;
			var menu_name_str_end;
			var menu_name_str;
			while(string)
			{
				menu_name_str_end = string.indexOf(";");
				menu_name_str = string.substr(0,menu_name_str_end);
				string = string.substr(menu_name_str_end+1);
				if(menu_name_str != "")
				{
					analyse_string(menu_name_str,i);
					i++;
				}
				else break;
			}
		};
	
		writeHTML = function()
		{
			var menu_i;
			var a_link_i;
			var i;
			for(k=0;k<menu_num_array[0];k++)
			{
				i = k+1;
				menu_i = menu_name_array[i];
				a_link_i = menu_num_array[i];
				menu_i=stk_codeChange_main(menu_i);
				document.getElementById("menu_child_"+i).value = menu_i;
			}
		};
		
		self.select_menu_item = function(main_menu_info)
		{
			page_num_submit = main_menu_info.main_num_value;
			showLoading();
			var params = {};
			params.operator = "stk_menu_item";
			params.item_no = page_num_submit;
			service.setSTKMenuInfo(params, function(result) {
				hideLoading();
				if (result.result == "success") {
					loadSTKWriteFlag();
				} else {
					errorOverlay();
				}
			});
		};
		
		select_main_item_radio = function()
		{
			if(self.child_menu_radio_value() == "")
			return;
			showLoading();
			var params = {};
			params.operator = "stk_menu_item";
			params.item_no = self.child_menu_radio_value();
			service.setSTKMenuInfo(params, function(result) {
				hideLoading();
				if (result.result == "success") {
					loadSTKWriteFlag();
				} else {
					errorOverlay();
				}
			});
		};

		exit_submit_button = function()
        {
            showLoading();
            var params = {};
            params.operator = "stk_exit";
            service.setSTKMenuInfo(params, function(result) {
                hideLoading();
                if (result.result == "success") {
                    loadSTKWriteFlag();
                    return;
                } else {
                    errorOverlay();
                }
            });
        };

        exit_submit_init = function()
        {
            showLoading();
            var params = {};
            params.operator = "stk_exit";
            service.setSTKMenuInfo(params, function(result) {
                hideLoading();
                if (result.result == "success") {
                    return;
                } else {
                    errorOverlay();
                }
            });
        };
		
		stk_codeChange_message = function(str)
		{
			var stk_message_text = str;
			var len_str = stk_message_text.length;
			var buffstr = stk_message_text.substr(0,2);
			
			if( stk_message_text == "#" )
			{
				new_str = "Message Sending";
			}
			else
			{
				if(buffstr  == "80")
				{
					var len_str = str.length;
					var new_str = str.substr(2,len_str);
					new_str = bytesToUnicode(new_str);
				}
				else
				{
					len_str = str.length;
					new_str = str.substr(0,len_str);
					new_str = decoding_ASCII(new_str);
				}
			}
			return new_str;
		};	
			
		submit_text_ZSMSR = function(){
			showLoading();
			loadSTKWriteFlag();
		};
		
		stk_codeChange_input = function(value_stk){
			var i = 0;
			var str = value_stk.toString();
			while(str)
			{
				var str_end = str.indexOf(",");
				if(str_end != -1 )
				{
					input_str = str.substr(0,str_end);
					str = str.substr(str_end+1);
					input_str_array[i] = input_str;
				}
				else 
				{
					input_str_array[i] = str;
					break;
				}
				i++;
			}
			var len_str = input_str_array[0].length;
			var buffstr = input_str_array[0].substr(0,2);
			if(buffstr  == "80")
			{
				input_str_array[0] = input_str_array[0].substr(2,len_str);
				input_str_array[0] =  bytesToUnicode(input_str_array[0]);
				return input_str_array[0];
			}
			else
			{
				input_str_array[0] =  decoding_ASCII(input_str_array[0]);
				return input_str_array[0];
			}			
		};

		text_style = function()
		{
			var length = parseInt(input_str_array[2]);
			if( length > 35)
			{
				document.getElementById("input_content").rows = "4";
			}
			else
			{
				document.getElementById("input_content").rows = "1";
			}
		};
		
		initInputBox = function()
		{
			document.getElementById("input_max").innerHTML = input_str_array[2];
			document.getElementById("input_min").innerHTML = input_str_array[3];
		};
		
		input_updata = function()
		{
			if (input_str_array[1] == 3)
			{
				update_maxNum();
			}
			else if(input_str_array[1] == 2)
			{
				isRigthNum(); 
			}
		};

		update_maxNum = function()
		{
			var content = document.getElementById("input_content").value;
			var unicodeNum = parseInt(input_str_array[2]/2);
			if ("" == content)
			{
				document.getElementById("input_max").innerHTML = input_str_array[2];
			}
			else 
			{
				isUnicode = encodeType(content);
				if ("UNICODE" == isUnicode )
				{
					document.getElementById("input_max").innerHTML = unicodeNum;
					if ( content.length > unicodeNum) 
					{
						alert("The input is too long");
						document.getElementById("input_content").value = content.substr(0,unicodeNum); 
					}	
					else
					{
						document.getElementById("input_max").innerHTML = unicodeNum;
					}
				}
				else
				{
					document.getElementById("input_max").innerHTML = input_str_array[2];
					if ( content.length > input_str_array[2])
					{
						document.getElementById("input_content").value = content.substr(0,input_str_array[2]);
						alert("The input is too long");
					}
					else
					{
						document.getElementById("input_max").innerHTML = input_str_array[2];
					}
					
				}
			}
		};
		
		encodeType = function(input)
		{
			var flag = "ASCII";
			if(input==null || input=="") 
			{
				return flag; 
			}
			for(var i=0;i<input.length;i++) 
			{ 
				var c=input.charCodeAt(i).toString(16);
				if(c.length >= 3)
				{
					flag = "UNICODE";
					break;
				}
			}
			return flag;
		};
		
		isRigthNum = function()
		{
			var input = document.getElementById("input_content").value;
			var strlen = 0;
			var tmpchr,i;

			strlen = input.length;
			for (i=0; i<strlen; i++)
			{
				tmpchr = input.charAt(i)
				if ((tmpchr == "0") || (tmpchr == "1") || (tmpchr == "2") ||
					(tmpchr == "3") || (tmpchr == "4") || (tmpchr == "5") ||
					(tmpchr == "6") || (tmpchr == "7") || (tmpchr == "8") ||
					(tmpchr == "9") || (tmpchr == "#") || (tmpchr == "*") ||
					(tmpchr == "+") )
				{	continue; }
				else
				{		   
					return false;
				}

			}
			return true;
		};

		input_apply = function()
		{
			var input=document.getElementById("input_content").value;
			
			if( input.length < input_str_array[3])
			{
				alert("The input is too short");
				return false;
			}
			if( input.length > input_str_array[2] )
			{
				alert("The input is too long");
				return false;
			}
			
			if (input_str_array[1] == 3)
			{
				input=input_coding_UNICODE(input);
			}else if (input_str_array[1] == 2)
			{
				if(isRigthNum()== false)
				{
					alert("Form of the number is wrong");
					return false;
				}
			}else if (input_str_array[1] == 0)
			{
				input=input_coding_ASCII(input);
			}
			
			showLoading();
			var params = {};
			params.operator = "stk_get_input";
			params.stk_content = input;
			params.stk_encode_type = input_str_array[1];			
			service.setSTKMenuInfo(params, function(result) {
				hideLoading();
				if (result.result == "success") {
					loadSTKWriteFlag();
				} else {
					errorOverlay();
				}
			});			

		};

		input_coding_UNICODE = function(input)
		{
			var ASCII_encode="";
			var UNICODE_encode = "";
			for(var i=0;i<input.length;i++) 
			{ 
				var c=input.charCodeAt(i).toString(16);
				if(c.length==1) 
				{
					c="000"+c;
				}
				else if(c.length==2)
				{
					c="00"+c; 
				}
				else if(c.length==3)
				{
					c="0"+c;
				}
				UNICODE_encode = UNICODE_encode + c;
			}
			UNICODE_encode=UNICODE_encode.toUpperCase();
			return UNICODE_encode;
		};

		input_coding_ASCII = function(input)
		{
			var ASCII_encode="";
			for(var i=0;i<input.length;i++) 
			{ 
				var c=input.charCodeAt(i).toString(16);
				if (c.length == 2)
				{
					ASCII_encode += c;
				}
				else if (c.length == 1)
				{
					ASCII_encode += "0"+c;	
				}
			}
			ASCII_encode=ASCII_encode.toUpperCase();			
			return ASCII_encode;
		};
			
		loadSTKWriteFlag = function(){
			var STKFlag = service.getSTKFlagInfo().stk_write_flag;
			if("2" != STKFlag  && "9" != STKFlag){
				isPopuping=false;
				hideLoading();
			}
			var name_stk;
			var value_stk;
			var stk = service.getSTKInfo().stk.toString();
			if("ZEND" == stk.toUpperCase()){
				name_stk = stk;
			}
			else{
				name_stk = stk.substr(0,stk.indexOf(":"));
				value_stk = stk.substr(stk.indexOf(":")+1);
			}
			
			var STKMenu = service.getSTKMenuInfo().stk_menu.toString();
			var name_STKMenu = STKMenu.substr(0,STKMenu.indexOf(":"));
			var value_STKMenu = STKMenu.substr(STKMenu.indexOf(":")+1);
			if("99" == STKFlag ){
				self.STKInfo(0);
			}
			else if("1" == STKFlag){
				self.STKInfo(1);
			}
			else if("2" == STKFlag  || "9" == STKFlag){				
				if(!isPopuping){
					isPopuping=true;
					showLoading();					
				}
				setTimeout(loadSTKWriteFlag, 1000);
			}		
			else if("3" == STKFlag){
				cut_down_number(value_STKMenu);
				push_menu_info();
				self.menu_name_array_0(stk_codeChange_main(menu_name_array[0]));
				self.main_menu_infos(main_menu_info_arr);
				self.STKInfo(2);
			}
			else if("0" == STKFlag){
				if("ZSTM" == name_stk)
				{
					cut_down_number(value_STKMenu);
					push_menu_info();
					self.menu_name_array_0(stk_codeChange_main(menu_name_array[0]));
					self.main_menu_infos(main_menu_info_arr);
					self.STKInfo(2);
				}else if("ZDIST" == name_stk)
				{
					self.stk_message_text(stk_codeChange_text(value_stk));
					self.STKInfo(3);
				}else if("ZSTI" == name_stk)
				{
					cut_down_number(value_stk);
					push_menu_info();
					if(menu_name_array[0] == "#")
					{
						menu_name_array[0] = "";
					}
					else
					{
						self.menu_name_array_0(stk_codeChange_main(menu_name_array[0]));
						self.main_menu_infos(main_menu_info_arr);
					}
					self.STKInfo(4);
				}else if("ZSMSR" == name_stk)
				{
					push_menu_info();
					self.menu_name_array_0(stk_codeChange_message(value_stk));
					self.STKInfo(5);
				}else if("ZGINP" == name_stk)
				{
					stk_codeChange_input(value_stk);
					self.menu_name_array_0(input_str_array[0]);
					text_style();
					initInputBox();			
					self.STKInfo(6);
				}else if("ZEND" == name_stk)
				{
					self.STKInfo(2);
					cut_down_number(value_STKMenu);
					push_menu_info();
					self.menu_name_array_0(stk_codeChange_main(menu_name_array[0]));
					self.main_menu_infos(main_menu_info_arr);
				}
			}else {
				self.STKInfo(0);
			}
		};
        exit_submit_init();
		loadSTKWriteFlag();
		
}

    /**
     * 初始化
     * @method init
     */
	function init() {
		var container = $('#container')[0];
		ko.cleanNode(container);
		var vm = new StkInformationViewModel();
		ko.applyBindings(vm, container);
		
	}	
	
	return {
		init : init
	};
});