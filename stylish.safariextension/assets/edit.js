var tpl1 = '<dl><dt>Edit style #{ID}</dt><dd class="editor"><form id="{ID}" class="styleseditor"><p class="stitle"><label for="TITLE{ID}">Title:</label><input type="text" name="title" value="{TITLE}" id="TITLE{ID}"></p></form></dd></dl><p class="controls"><button class="add">Add section</button><button id="save" class="fr">Save Style</button></p>',
	tpl2 = '<fieldset><legend>Section #{NUM}</legend><p class="code"><label for="CSS{NUM}">CSS:</label><textarea class="code zc-use_tab-true zc-syntax-css zc-profile-css" id="CSS{NUM}">{CODE}</textarea></p>{RULES}<p class="controls section"><button class="remove fr">Delete section</button></p></fieldset>',
	tpl3 = '<p class="rule last" rel="RULE{NUM}"><label>Applies to:</label><select name="apply"><option value="url">URL</option><option value="pre">URL prefix</option><option value="dom">Domain</option><option value="reg">Regexp</option></select><input name="rule" type="text" value="{RULE}"><button class="remove">Delete</button><button class="add">Add rule</button></p>',
	datain, b,
	dl = document.location,
	id = dl.hash.substr(1);

$(function() {
	navInit();
	var b = $('#content');
	
	$('.rule .add').live('click',function(event) {
		event.preventDefault();
		var b = $(this), p = b.parent(), n = parseInt($('.rule',p.parent()).length)+1;
		$('.rule .remove',p.parent()).removeAttr('disabled');
		p.after(
			$(tpl3.replace(/\{RULE\}/g,'').replace(/\{NUM\}/g,n))
		);
		return false;
	})

	$('.rule .remove').live('click',function(event) {
		event.preventDefault();
		var b = $(this), p = b.parent(), fs = p.parent(), f = $('form');
		$('.rule .remove',fs).attr('disabled','disabled');
		if ($('.rule',fs).length > 1) {
			p.remove();
		}
		if ($('.rule',fs).length > 1) {
			$('.rule .remove',fs).removeAttr('disabled');
		}
		return false;
	})

	$('.controls .add').live('click',function(event) {
		event.preventDefault();

		var slen = $('.styleseditor fieldset').length,
			stpl = tpl2.replace(/\{CODE\}/g,'').replace(/\{NUM\}/g,slen),
			rule = tpl3.replace(/\{NUM\}/g,slen).replace(/\{RULE\}/g,'');

		$('.styleseditor').append(
			$(stpl.replace(/\{RULES\}/g,rule))
		)

		if ($('.styleseditor fieldset').length == 1) {
			$('.controls .remove').hide();
		} else {
			$('.controls .remove').show();
		}
		return false;
	})

	$('.controls .remove').live('click',function(event) {
		event.preventDefault();
		var b = $(this), section = b.parent().parent();
		section.remove();

		if ($('.styleseditor fieldset').length == 1) {
			$('.controls .remove').attr('disabled','disabled');
		} else {
			$('.controls .remove').removeAttr('disabled');
		}

		return false;
	})
	
	$('#save').live('click',function() {
		var data = {}, id = $(this).val();
		data = { "enabled":datain.enabled, "name" : $('.stitle input').val(), "url" : datain.url, "updateUrl" : datain.updateUrl, "sections" : [] };

		$.each($('.styleseditor fieldset'), function(i,f) {
			var dom = [], reg = [], url = [], pre = []; 
			$.each($('.rule',f),function(n,rule) {
				var type = $('select',rule).val(),
					val = $('input',rule).val();
				switch(type) {
					case 'dom':
						dom.push(val);
					break;
					case 'reg':
						reg.push(val);
					break;
					case 'url':
						url.push(val);
					break;
					case 'pre':
						pre.push(val);
					break;
				}
			})
			data.sections[i] = {
				"code" : $('textarea.code',f).val(),
				"domains" : dom,
				"regexps" : reg,
				"urlPrefixes" : pre,
				"urls" : url
			}
		})
		if (JSON.stringify(data).hashCode()!=JSON.stringify(datain).hashCode()) {
			ping('saveStyle', {"id":id,"json":data});
		}
		window.location = safari.extension.baseURI + "manage.html";
	});

	$('#back').live('click',function(event) {
		event.preventDefault();
		window.location = safari.extension.baseURI + "manage.html";
		return false;
	});

	if (id) {
		ping('editStyle', {"id":id});
	} else {
		editStyle(false,{"name":"New Style","sections":[{"domains":[''],"urls":[],"urlPrefixes":[],"regexps":[],"code":""}],"updateUrl":"","url":"","enabled":true});
	}
		
})

	function editStyle(id, json) {
		if ($('#content').hasClass('inprogress')) return;
		json = id?$.parseJSON(json):json;
		id = id?id:(new Date().getTime());
		datain = json;
		var html = $(tpl1.replace(/\{TITLE\}/g,json.name).replace(/\{ID\}/g,id)), stpl ='',
			b = $('#content');
		b.append(html);
		$.each(json.sections,function(i1,section) {
			stpl = tpl2.replace(/\{NUM\}/g,i1);
			var rules1='', rules2 ='', rules3 ='', rules4 = '';
			$.each(section.urls,function(i2, rule) {
				rules1 += tpl3.replace(/\{NUM\}/g,i2).replace(/\{RULE\}/g,rule);
			});
			$.each(section.urlPrefixes,function(i2, rule) {
				rules2 += tpl3.replace(/\{NUM\}/g,i2).replace(/\{RULE\}/g,rule);
			});
			$.each(section.domains,function(i2, rule) {
				rules3 += tpl3.replace(/\{NUM\}/g,i2).replace(/\{RULE\}/g,rule);
			});
			$.each(section.regexps,function(i2, rule) {
				rules4 += tpl3.replace(/\{NUM\}/g,i2).replace(/\{RULE\}/g,rule);
			});
			rules1 = rules1.replace(/value=\"url\"/g,'value="url" selected');
			rules2 = rules2.replace(/value=\"pre\"/g,'value="pre" selected');
			rules3 = rules3.replace(/value=\"dom\"/g,'value="dom" selected');
			rules4 = rules4.replace(/value=\"reg\"/g,'value="reg" selected');
			
			$('.styleseditor').append($(stpl.replace(/\{RULES\}/g,rules1+rules2+rules3+rules4)));
			$('.styleseditor textarea').last().val(section.code).attr('rows',section.code.length>400?16:6);

		});
		if ($('.styleseditor fieldset').length == 0) {
			$('.controls .remove').attr('disabled','disabled');
		}
		$('.styleseditor fieldset').each(function() {
			var f = $(this);
			if ($('.rule',f).length == 1) {
				$('.rule .remove',f).attr('disabled','disabled');
			}
		});
		$('#save').val(id);
		$('#content').addClass('inprogress');

		zen_textarea.setup();
	}

function ping(name,data) {
	safari.self.tab.dispatchMessage(name,data);
}
	
function pong(event) {
	var n = event.name,
		m = event.message,
		t = event.target;
	switch(n) {
		case 'setInstalledStyles':
			renderStylesList(m);
		break;
		case 'editStyle':
			editStyle(m.id,m.json);
		break;
	}
}

function log(l) {
	console.log(l);
}

safari.self.addEventListener("message", pong, true);