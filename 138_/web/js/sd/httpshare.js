/**
 * SD卡 HttpShare模块
 * @module HttpShare
 * @class HttpShare
 */
define([ 'jquery', 'underscore','lib/jquery/jQuery.fileinput', 'config/config', 'service', 'knockout' ], function($, _, fileinput, config, service, ko) {
	// var fileSet = [];
	// var fileTypes = [ 'file', 'music', 'picture', 'folder-close' ];
	/**
	 * 每页记录条数
	 * 现在9x15平台不能够设置每页数据个数，默认为10个。目前此变量不能够修改
	 * @attribute {Integer} perPage
	 */
	var perPage = 10;
	/**
	 * 当前页
	 * @attribute {Integer} activePage
	 */
	var activePage = 1;
	/**
	 * 当前目录，默认根目录""
	 * @attribute {String} currentPath
	 */
	var currentPath = "";
	/**
	 * 基目录。感觉此根目录不显示给用户会更友好
	 * @attribute {String} basePath
	 */
	var basePath = config.SD_BASE_PATH;
	/**
	 * 前置路径，发现有的设备会将sd卡数据显示在web目录
	 * @attribute {String} prePath
	 * @example
	 * prePath = "/usr/zte/zte_conf/web";
	 */
	var prePath = "";// "/usr/zte/zte_conf/web";
	/**
	 * 是否隐藏重命名按钮
	 * @attribute {Boolean} readwrite
	 */
	var readwrite = true;
	/**
	 * 文件列表模板
	 * @attribute {Object} sdFileItemTmpl
	 */
	var sdFileItemTmpl = null,
	/**
	 * 分页模板
	 * @attribute {Object} pagerTmpl
	 */
		pagerTmpl = null,
    /**
     * 配置信息原始状态
     * @attribute {Object} originalStatus
     */
        originalStatus = null;

    var zoneOffsetSeconds = new Date().getTimezoneOffset() * 60;

    var shareFilePath = '';
	/**
	 * 生成分页数据数组
	 * @method generatePager
	 * @param {Integer} totalSize 总记录数
	 * @param {Integer} perPageNum 每页记录条数
	 * @param {Integer} currentPage 当前页
	 * @return {Array} 分页数据数组
	 */
	function generatePager(totalSize, perPageNum, currentPage) {
        if(totalSize == 0){
            return [];
        }
		var pagersArr = [];
		var totalPages = getTotalPages(totalSize, perPageNum);
		pagersArr.push({
			pageNum : currentPage - 1,
			isActive : false,
			isPrev : true,
			isNext : false,
			isDot : false
		});
		if (currentPage > 5) {
			pagersArr.push({
				pageNum : 1,
				isActive : false,
				isPrev : false,
				isNext : false,
				isDot : false
			});
			pagersArr.push({
				pageNum : 0,
				isPrev : false,
				isNext : false,
				isActive : false,
				isDot : true
			});
		}
		var i;
		var startPage = currentPage - 4 > 0 ? currentPage - 4 : 1;
		var endPage = currentPage + 4;
		for (i = startPage; i <= endPage && i <= totalPages; i++) {
			pagersArr.push({
				pageNum : i,
				isActive : i == currentPage,
				isPrev : false,
				isNext : false,
				isDot : false
			});
		}
		if (currentPage + 3 <= totalPages && i - 1 != totalPages) {
			pagersArr.push({
				pageNum : 0,
				isPrev : false,
				isNext : false,
				isActive : false,
				isDot : true
			});
			pagersArr.push({
				pageNum : totalPages,
				isPrev : false,
				isNext : false,
				isActive : false,
				isDot : false
			});
		}
		pagersArr.push({
			pageNum : parseInt(currentPage, 10) + 1,
			isPrev : false,
			isNext : true,
			isActive : false,
			isDot : false
		});
		return pagersArr;
	}

	function getTotalPages(total, perPage){
		var totalPages = Math.floor(total / perPage);
		if (total % perPage != 0) {
			totalPages++;
		}
		return totalPages;
	}

	/**
	 * 整理文件列表数据，并用模板显示
	 * @method showFileSet
	 * @param {Array} files 列表数据
	 */
	function showFileSet(files) {
		var i = 0;
		var shownFiles = $.map(files, function(n) {
			var obj = {
                fileName : n.fileName,
                fileNameShow : subFileName(n.fileName),
				fileType : n.attribute == 'document' ? 'folder' : getFileType(n.fileName),
				fileSize : getDisplayVolume2(n.size, false),
				filePath : basePath + getCurrentPath() + "/" + n.fileName,
                lastUpdateTime : transUnixTime((parseInt(n.lastUpdateTime, 10) + zoneOffsetSeconds) * 1000),
				trClass : i % 2 == 0 ? "even" : "",
				readwrite : readwrite
			};
			i++;
			return obj;
		});

		if(sdFileItemTmpl == null){
			sdFileItemTmpl = $.template("sdFileItemTmpl", $("#sdFileItemTmpl"));
		}
		$("#fileList_container").html($.tmpl("sdFileItemTmpl", {data: shownFiles}));
	}
   function subFileName(fileName){
         var len = 20;
         if(fileName && fileName != ""){
             return fileName.length > len ? fileName.substring(0, len) + "..." : fileName;
         }else{
             return "";
         }
   }
	/**
	 * HttpShareViewModel
	 * 
	 * @class HttpShareViewModel
	 */
	function HttpShareViewModel() {
		var isGuest = false;
		if(window.location.hash == "#httpshare_guest"){
			isGuest = true;
		}
		readwrite = true;
		activePage = 1;
        setCurrentPath('');
		basePath = config.SD_BASE_PATH;
		showLoading('operating');
		service.getSDConfiguration({}, function(data){
            originalStatus = data;
            shareFilePath = data.share_file;
			if(data.sd_status == '1' && data.sd_mode == '0'){ //共享
				if(isGuest && data.share_status == '1'){// guest and share
					basePath = data.share_file;
					if(data.share_auth == '0'){ // readonly
						readwrite = false;
						$("#uploadSection, #delete_file_button, .sd_guest_hide_th", "#httpshare_form").hide().remove();
					}
					$("#go_to_login_button").removeClass("hide");
					if ($(".customfile").length == 0) {
						$("#fileField").customFileInput();
					}
					pagerItemClickHandler(1);
				} else if(isGuest && data.share_status == '0'){ // guest not share
					$(".form-body .content", "#httpshare_form").hide().remove();
					$(".form-title", "#httpshare_form").attr("trans", "httpshare").html($.i18n.prop("httpshare"));
					$(".form-note", "#httpshare_form").attr("trans", "note_http_share_cannot_access").html($.i18n.prop("note_http_share_cannot_access"));
				} else {
					if ($(".customfile").length == 0) {
						$("#fileField").customFileInput();
					}
					pagerItemClickHandler(1);
				}
			} else { // usb
				$(".form-body .content", "#httpshare_form").hide().remove();
				$(".form-title", "#httpshare_form").attr("trans", "httpshare").html($.i18n.prop("httpshare"));
				$(".form-note", "#httpshare_form").attr("trans", "note_http_share_usb_access").html($.i18n.prop("note_http_share_usb_access"));
                $(".form-note").show();
                $(".form-note", "#httpshare_form").addClass("margintop10");
				hideLoading();
			}
		}, function(){
            errorOverlay();
            $(".form-body .content", "#httpshare_form").hide().remove();
            $(".form-title", "#httpshare_form").attr("trans", "httpshare").html($.i18n.prop("httpshare"));
            $(".form-note", "#httpshare_form").attr("trans", "note_http_share_cannot_access").html($.i18n.prop("note_http_share_cannot_access"));
        });
	}
	
	/**
	 * 页码点击事件处理
	 * @event pagerItemClickHandler
	 * @param {Integer} num 页码
	 */
	pagerItemClickHandler = function(num) {
		activePage = num;
		refreshFileList(getCurrentPath(), activePage);
	};

    function checkConfiguration(){
        var data = service.getSDConfiguration();
        if(!_.isEqual(originalStatus, data)){
            showAlert('sd_config_changed_reload', function(){
                init();
            });
            return false;
        }
        return true;
    }

    /**
     * 检查操作路径是否为共享路径，如果是共享路径，给用户提示
     * @param path
     * @param wording
     * @returns {boolean}
     */
    function inSharePath(path, wording) {
        if (originalStatus.share_status == '1' && shareFilePath != '' && shareFilePath != '/' && shareFilePath.indexOf(path) != -1) {
            showAlert(wording);
            return true;
        }
        return false;
    }

	/**
	 * 进入文件夹
	 * @method enterFolder
	 * @param {String} name 文件夹名
	 */
	enterFolder = function(name) {
        if(!checkConfiguration()){
            return false;
        }
		var path;
		if (name == "") {
			path = "";
		} else {
			path = getCurrentPath() + '/' + name;
		}
		refreshFileList(path, 1);
        return true;
	};

	/**
	 * 回到上一级目录
	 * @method backFolder
	 */
	backFolder = function() {
        if(!checkConfiguration()){
            return false;
        }
		var path = getCurrentPath().substring(0, getCurrentPath().lastIndexOf("/"));
		refreshFileList(path, 1);
        return true;
	};

	/**
	 * 刷新文件列表
	 * @method refreshFileList
	 * @param {String} path 文件夹名,"/"开头
     * @param {Integer} index 页码
     * @param {Boolean} alertShown alert是否已经显示
	 */
	refreshFileList = function(path, index, alertShown) {
		if(!alertShown){
            showLoading('operating');
        }
		service.getFileList({
			path : prePath + basePath + path,
			index : index
		}, function(data) {
			if (isErrorObject(data)) {
				showAlert(data.errorType);
				return;
            }
            setCurrentPath(path);
			$("#sd_path").val(path);
			activePage = index;
			totalSize = data.totalRecord;
			showFileSet(data.details);
			pagination(totalSize); //测试分页时可以将此处totalSize调大
			refreshBtnsStatus();
			updateSdMemorySizes();
            if(!alertShown){
			    hideLoading();
            }
		});
	};

	/**
	 * 更新按钮状态
	 * @method refreshBtnsStatus
	 */
	refreshBtnsStatus = function() {
		if (getCurrentPath() == "") {
			$("#rootBtnLi, #backBtnLi").hide();
		} else {
			$("#rootBtnLi, #backBtnLi").show();
		}
		if (readwrite) {
			$("#createNewFolderLi").hide();
			$("#newFolderBtnLi").show();
			$("#newFolderName").val('');
			$("#createNewFolderErrorLabel").removeAttr('trans').text('');
		} else {
			$("#newFolderBtnLi, #createNewFolderLi").hide().remove();
		}
        checkDeleteBtnStatus();
	};

	/**
	 * 显示新建文件夹按钮点击事件
	 * @event openCreateNewFolderClickHandler
	 */
	openCreateNewFolderClickHandler = function() {
		$("#newFolderBtnLi").hide();
		$("#createNewFolderLi").show();
	};

	/**
	 * 取消显示新建文件夹按钮点击事件
	 * @event cancelCreateNewFolderClickHandler
	 */
	cancelCreateNewFolderClickHandler = function() {
		$("#createNewFolderLi").hide();
        $("#newFolderName").val('');
		$("#newFolderBtnLi").show();
	};

	/**
	 * 新建文件夹按钮点击事件
	 * @event createNewFolderClickHandler
	 */
	createNewFolderClickHandler = function() {
        if(!checkConfiguration()){
            return false;
        }
		var newFolderName = $.trim($("#newFolderName").val());
		if (newFolderName == "") {
			$("#createNewFolderErrorLabel").attr('trans', 'sd_card_folder_name_is_null').text($.i18n.prop("sd_card_folder_name_is_null"));
			$("#newFolderName").focus();
			return false;
		}
		var newPath = prePath + basePath + getCurrentPath() + "/" + newFolderName;

		if (newPath.length >= 200) {
			$("#createNewFolderErrorLabel").attr('trans', 'sd_card_path_too_long').text($.i18n.prop("sd_card_path_too_long"));
			$("#newFolderName").focus();
			return false;
		}
		if (!checkFileNameChars(newFolderName, false)) {
			$("#createNewFolderErrorLabel").attr('trans', 'check_file_path').text($.i18n.prop("check_file_path"));
			$("#newFolderName").focus();
			return false;
		}
        showLoading('creating');
		service.checkFileExists({
			path : newPath
		}, function(data1) {
			if (data1.status == "noexist") {
				service.createFolder({
					path : newPath
				}, function(data) {
					if (isErrorObject(data)) {
						showAlert(data.errorType);
						return false;
					} else {
                        successOverlay();
                        refreshFileList(getCurrentPath(), 1);
                    }
				});
			} else if (data1.status == "no_sdcard") {
                showAlert("no_sdcard", function(){
                    window.location.reload();
                });
			} else if (data1.status == "exist") {
				$("#createNewFolderErrorLabel").attr('trans', 'sd_card_share_setting_exist').text($.i18n.prop("sd_card_share_setting_exist"));
				hideLoading();
			}
		}, function(){
            errorOverlay();
        });
        return true;
	};

	/**
	 * 重命名按钮点击事件
	 * @event renameBtnClickHandler
	 * @param {String} oldName 原文件名
	 */
	renameBtnClickHandler = function(oldName) {
        var oldPath = prePath + basePath + getCurrentPath() + "/" + oldName;
        if(inSharePath(oldPath, 'sd_share_path_cant_rename')){
            return false;
        }
        showPrompt3("sd_card_folder_name_is_null", function() {
            if(!checkConfiguration()){
                return false;
            }
            var promptInput = $("div#confirm3 div.promptDiv input#promptInput3");
            var newFolderName = $.trim(promptInput.val());
            var newPath = prePath + basePath + getCurrentPath() + "/" + newFolderName;
			if (newFolderName == "") {
				$(".promptErrorLabel").text($.i18n.prop("sd_card_folder_name_is_null"));
				promptInput.focus();
				return false;
			}

			if (newPath.length >= 200) {
				$(".promptErrorLabel").text($.i18n.prop("sd_card_path_too_long"));
				promptInput.focus();
				return false;
			}
			if (!checkFileNameChars(newFolderName, false)) {
				$(".promptErrorLabel").text($.i18n.prop("check_file_path"));
				promptInput.focus();
				return false;
			}
			service.checkFileExists({
				path : newPath
			}, function(data1) {
				if (data1.status == "noexist") {
					hideLoadingButtons();
					var oldPath = prePath + basePath + getCurrentPath() + "/" + oldName;
					service.fileRename({
						oldPath : oldPath,
						newPath : newPath,
						path : prePath + basePath + getCurrentPath()
					}, function(data) {
						if (isErrorObject(data)) {
							showAlert(data.errorType);
						} else {
                            refreshFileList(getCurrentPath(), 1);
                            successOverlay();
                        }
                        showLoadingButtons();
						return true;
					});
				} else if (data1.status == "no_sdcard") {
					showAlert("no_sdcard", function(){
                        window.location.reload();
                    });
					return false;
				} else if (data1.status == "exist") {
					$(".promptErrorLabel").text($.i18n.prop("sd_card_share_setting_exist"));
					return false;
				}
                return true;
			}, function(){
                errorOverlay();
            });
            return false;
		}, 160, oldName);
	};

    hideLoadingButtons = function () {
        $(".buttons", "#confirm").hide();
    };

    showLoadingButtons = function () {
        $(".buttons", "#confirm").show();
    };

	/**
	 * 删除按钮点击事件
	 * @event deleteBtnClickHandler
	 */
	deleteBtnClickHandler = function() {
        if(!checkConfiguration()){
            return false;
        }
		var files = $("input:checkbox:checked", "#fileList_container");
		var fileNames = "";
		if (!files || files.length == 0) {
            showAlert("no_data_selected");
			return false;
		}
        var hasSharePath = false;
        $.each(files, function (i, n) {
            var theFile = $(n).val();
            if (inSharePath(prePath + basePath + getCurrentPath() + "/" + theFile, {msg: 'sd_share_path_cant_delete', params: [theFile]})) {
                hasSharePath = true;
                return false;
            }
            return true;
        });
        if (hasSharePath) {
            return false;
        }
		showConfirm("confirm_data_delete", function(){
			$.each(files, function(i, n) {
				fileNames += $(n).val() + "*";
			});
			var thePath = prePath + basePath + getCurrentPath();
			service.deleteFilesAndFolders({
				path : thePath,
				names : fileNames
			}, function(data) {
				if (isErrorObject(data)) {
					showAlert(data.errorType);
					return;
				}
				successOverlay();
				refreshFileList(getCurrentPath(), 1);
			}, function(){
                errorOverlay();
            });
		});
        return true;
	};

	/**
	 * 文件上传按钮点击事件
	 * @event deleteBtnClickHandler
	 */
	fileUploadSubmitClickHandler = function() {
        if(!checkConfiguration()){
            return false;
        }
		var fileName = $(".customfile").attr('title');
		if (typeof fileName == "undefined" || fileName == '' || fileName == $.i18n.prop("no_file_selected")) {
            showAlert("sd_no_file_selected");
			return false;
		}
		var newPath = (basePath + getCurrentPath() + "/" + fileName).replace("//", "/");
		if (newPath.length >= 200) {
			showAlert("sd_card_path_too_long");
			return false;
		}
        showLoading('uploading', '<span trans="note_uploading_not_refresh">' + $.i18n.prop('note_uploading_not_refresh') + '</span>');
		service.checkFileExists({
			path : newPath
		}, function(data1) {
			if (data1.status == "noexist") {
				$("#fileUploadForm").attr("action", "/cgi-bin/" + fileName);
                var currentTime = new Date().getTime();
                $("#path_SD_CARD_time").val(transUnixTime(currentTime));
                $("#path_SD_CARD_time_unix").val(Math.round((currentTime - zoneOffsetSeconds * 1000) / 1e3));
                if(!iframeLoadBinded){
                    bindIframeLoad();
                }
				$("#fileUploadForm").submit();
			} else if (data1.status == "no_sdcard") {
                showAlert("no_sdcard", function(){
                    window.location.reload();
                });
			} else if (data1.status == "exist") {
				showAlert("sd_card_share_setting_exist");
			}
		}, function(){
            errorOverlay();
        });
        return true;
	};
    var iframeLoadBinded = false;
    function bindIframeLoad(){
        iframeLoadBinded = true;
        $('#fileUploadIframe').load(function() {
            var txt = $('#fileUploadIframe').contents().find("body").html().toLowerCase();
            $("#fileField").closest('.customfile').before('<input id="fileField" name="filename" maxlength="200" type="file" dir="ltr"/>').remove();
            addTimeout(function(){
                $("#fileField").customFileInput();
            }, 0);
            var alertShown = false;
            if (txt.indexOf('success') != -1) {
                successOverlay();
            } else if (txt.indexOf('space_not_enough') != -1) {
                alertShown = true;
                showAlert('sd_upload_space_not_enough');
            } else if (txt.indexOf('data_lost') != -1) {
                alertShown = true;
                showAlert('sd_upload_data_lost');
            } else {
                errorOverlay();
            }

            $("#uploadBtn", "#uploadSection").attr("trans", "browse_btn").html($.i18n.prop('browse_btn'));
            $(".customfile", "#uploadSection").removeAttr("title");
            $(".customfile span.customfile-feedback", "#uploadSection")
                .html('<span trans="no_file_selected">'+$.i18n.prop('no_file_selected')+'</span>')
                .attr('class', 'customfile-feedback');
            refreshFileList(getCurrentPath(), 1, alertShown);
        });
    }
	
	/**
	 * 更新SD卡容量显示数据
	 * @method updateSdMemorySizes
	 */
	updateSdMemorySizes = function() {
        setInterval(function(){
            service.getSdMemorySizes({}, function(data) {
                if (isErrorObject(data)) {
                //	showAlert(data.errorType);
                    return false;
                }
                    var total = getDisplayVolume2(data.totalMemorySize, false);
                    var used = getDisplayVolume2(data.totalMemorySize - data.availableMemorySize, false);
                    $("#sd_volumn_used").text(used);
                    $("#sd_volumn_total").text(total);

                return true;
            });
        },1000)
	};


	/**
	 * 翻页
	 * @method pagination
	 */
	pagination = function(fileTotalSize) {
		var pagers = generatePager(fileTotalSize, perPage, parseInt(activePage, 10));
		if(pagerTmpl == null){
			pagerTmpl = $.template("pagerTmpl", $("#pagerTmpl"));
		}
		$(".pager", "#fileListButtonSection").html($.tmpl("pagerTmpl", {data: {pagers : pagers, total : getTotalPages(fileTotalSize, perPage)}}));
		renderCheckbox();
		$(".content", "#httpshare_form").translate();
	};

	/**
	 * 文件名特殊字符检查
	 * @method checkFileNameChars
	 * @param {String} filename 文件名
	 * @param {Boolean} isIncludePath 是否包含路径
	 */
	function checkFileNameChars(filename, isIncludePath) {
		var invalidASCStr = '+/:*?<>\"\'\\|#&`~';
		if(isIncludePath){
			invalidASCStr = '+:*?<>\"\'\\|#&`~';
		}
		var flag = false;
		var dotFlag = false;
		var reg = /^\.+$/;
		for ( var k = 0; k < filename.length; k++) {
			for ( var j = 0; j < invalidASCStr.length; j++) {
				if (filename.charAt(k) == invalidASCStr.charAt(j)) {
					flag = true;
					break;
				}
			}
			if (reg.test(filename)) {
				dotFlag = true;
			}
			if (flag || dotFlag) {
				return false;
			}
		}
		return true;
	}
	
	/**
	 * 下载文件是检查文件路径是否包含特殊字符
	 * @method checkFilePathForDownload
	 * @param {String} path 文件路径
	 */
	checkFilePathForDownload = function(path){
        if(!checkConfiguration()){
            return false;
        }
		var idx = path.lastIndexOf('/');
		var prePath = path.substring(0, idx+1);
		var name = path.substring(idx+1, path.length);
		if(checkFileNameChars(prePath, true) && checkFileNameChars(name, false)){
			return true;
		}
		showAlert('sd_card_invalid_chars_cant_download');
		return false;
	};
	
	gotoLogin = function(){
		window.location.href="#login";
	};

    function bindEvent(){
        $("p.checkbox", "#httpshare_form").die().live('click', function () {
            addTimeout(function () {
                checkDeleteBtnStatus();
            }, 100);
        });
        $(".icon-download", "#httpshare_form").die().live("click", function () {
            return checkFilePathForDownload($(this).attr("filelocal"));
        });
        $(".folderTd", "#httpshare_form").die().live("click", function () {
            return enterFolder($(this).attr("filename"));
        });
        $(".fileRename", "#httpshare_form").die().live("click", function () {
            return renameBtnClickHandler($(this).attr("filename"));
        });
    }

    function checkDeleteBtnStatus(){
        var checkedItem = $("p.checkbox.checkbox_selected", '#fileListSection');
        if(checkedItem.length > 0){
            enableBtn($('#delete_file_button'));
            $('#delete_file_button div').removeClass("btn-delete_disabled").addClass("btn-delete");
        } else {
            disableBtn($('#delete_file_button'));
            $('#delete_file_button div').addClass("btn-delete_disabled");
        }
    }

    function getCurrentPath(){
        return currentPath;
    }

    function setCurrentPath(path){
        if(path.lastIndexOf("/") == path.length - 1){
            currentPath = path.substring(0, path.length - 1);
        } else {
            currentPath = path;
        }
    }

	function init() {
        if(window.location.hash == "#httpshare_guest"){
            $("#dropdownMain").hide();
            $("#dropdownMainForGuest").show();
        }else{
            $("#dropdownMain").show();
            $("#dropdownMainForGuest").hide();
        }
		var container = $('#container')[0];
		ko.cleanNode(container);
		var vm = new HttpShareViewModel();
		ko.applyBindings(vm, container);
        bindEvent();
	}

	return {
		init : init
	};
});