$(document).ready(function() {
	var debug = {
		log: false
	}

	var options = {
		avatar : {
			line: 6
			,photoInLine : 3
			,baseSize : {
				width : 150
				,height : 262
			}
		}
		,battle : {
			teamInSide : 5
			,teamElIdx : [ 2, 1, 3, 0, 4]
			,counters : ['health-point', 'energy', 'adrenaline']
		}
		,race : ['human', 'raksasah', 'seylees']
		,gender : ['male', 'female']
	}

	//create global variable for socket
	socket = io.connect('/');


	var setWrapperVertical = function() {
		var wrapperHeight = $('#wrapper').outerHeight();
		var htmlHeight = $(window).height();
		var wrapperTopMargin = (htmlHeight - wrapperHeight) / 2

		//var windowsHeight = $(window).height();
		//var windowsWidth = $(window).width();

		if(wrapperTopMargin > 0) {
			$('#wrapper').css({marginTop : wrapperTopMargin});
		}
	}
	setWrapperVertical();

	//UI Elements
	//ui counters
	socket.on('counters', function(data){
		if( debug.log ) { console.log( 'socket counters ', data ); }
		setUiCounters( data.counters );
	});

	var setUiCounters = function(counters) {
		for(var name in counters) {
			var value = counters[name];
			var counterEl = $('#wrapper .ui-counter[name="' + name + '"]');
			$(counterEl).find('.label div').eq(0).html(value);

			updateUiCounterBar(counterEl)
		}
	}

	var updateUiCounterBar = function(counter) {

		var values = [
			$(counter).find('.label div').eq(0).html()
			,$(counter).find('.label div').eq(2).find('.ui-variable').html()
		];

		var barWidth = values[0]/values[1]*100;
		if( barWidth > 100 ) {
			barWidth = 100;
		}

		barWidth+= '%';
		$(counter).find('.bar').css({'width' : barWidth});
	}


	//ui variables
	socket.on('variables', function(data){
		setVariables(data.variables, data.uid);
	});

	var setVariables = function(variables, uid) {

		if( debug.log ) { console.log( 'variables ' + variables ); }

		for(var name in variables) {
			var value = variables[name];
			var elements = $('#wrapper .ui-variable');

			var el = $(elements).filter('[name="' + name + '"][uid=' + uid + ']')

			if( $(el).hasClass('percent')) {
				value = value * 100;
				value = value + '%';
			}

			$(el).html(value);

			var parent = $(el).parents('.ui-counter').eq(0);

			if( $( parent ).hasClass( 'ui-counter' ) ) {
				updateUiCounterBar( parent );
			}
		}
	}

	//avatar
	var setUiAvatar = function( el){
		var race = $( el).data( 'race');
		var gender = $( el).data( 'gender');
		var item = $( el).data( 'item');

		if( ! race || ! gender || ! item) {
			return false;
		}

		console.log(race, gender, item);

		var genderIndex = options.gender.indexOf( gender);
		var raceLineIndex = ( options.race.indexOf( race) * options.gender.length) + genderIndex;

		var blockWidth	= $( el).width();
		var scaleRate	= blockWidth / options.avatar.baseSize.width;
		var scaleHeight	= options.avatar.baseSize.height * scaleRate;

		console.log( scaleRate, scaleHeight);

		var positionVertical = -1 * scaleHeight  * raceLineIndex; //70
		var positionHorizontal = -1 * blockWidth * item

		//var backgroundPosition = backgroundPositionHorizontal + 'px ' + backgroundPositionVertical + 'px';
		var backgroundPosition = positionHorizontal + 'px ' + positionVertical + 'px';
		var backgroundSize = options.avatar.photoInLine + '00%';

		$( el).css( { backgroundSize: backgroundSize, backgroundPosition: backgroundPosition});
	}

	//map
	var setUiFormButton = function(el){
		$(el).click(function(){
			$(this).find('form').submit();
		})
	}

	var setUi = function(){
		//tips
		$( '.ui-item' ).tooltip({
			track: true
			,items: ".ui-item"
			,content: function() {
				var element = $( this );
				var html = $(element).find('.tip').html();

				html = '<div class="item">' + html + '</div>';
				return html;
			}
		});

		//counters
		var counters = $('#wrapper .ui-counter');

		$(counters).each(function(indx){
			updateUiCounterBar(this);
		});

		//avatars
		var avatars = $('#wrapper .ui-avatar');
		$(avatars).each(function(indx){
			setUiAvatar(this);
		});

		//active ui form
		var formButtons = $('#wrapper .ui-form');
		$(formButtons).each(function(indx){
			setUiFormButton(this);
		});
	}


	//Items dnd
	var setDnD = function(){
		var sendItemExchange = function(dropZone, dragZone){

			var zones = [
				dropZone
				,dragZone
			]

			var data = [];
			for(var zoneIdx in zones) {
				var zone = zones[zoneIdx];

				var type = $(zone).parent().prop('class').split(' ')[0];

				if( type == 'equipment') {
					var subType = $(zone).prop('class').split(' ')[0];
					var elIndex = $(zone).index('.' + subType);
				} else {
					var subType = null;
					var elIndex = $(zone).index();
				}

				data.push({
					type: type
					,subType: subType
					,index: elIndex
				});
			}

			socket.emit('item/exchange', data);
		}

		var dndItemExchange = function( dropZone, dragEl ){
			if( $(dropZone).is('.disable') ) {
				return false;
			}

			var dragZone = $(dragEl).parent('li');

			sendItemExchange(dropZone, dragZone);

			if( $(dropZone).find('.ui-item').is('.ui-item') ) {
				var exchangeEl = $(dropZone).find('.ui-item');
				$(exchangeEl).appendTo(dragZone);

			} else {
				$(dragZone).find('svg').show();
			}

			$(dropZone).find('svg').hide();
			$(dragEl).appendTo(dropZone);
		}

		var options = {
			draggable: {
				cursor: 'crosshair'
				,revert: true
				,revertDuration: 0
			}
			,droppable: {
				activeClass: 'active'
				,hoverClass: 'hover'
				,tolerance: 'pointer'
				,drop: function(event, ui){
					var dropZone = this;
					var dragEl = ui.draggable;

					dndItemExchange( dropZone, dragEl );
				}
			}
		}

		$('#widgets [draggable=true]').not('.disable').draggable(options.draggable);

		//equipment
		var equipmentTypes = ['bracelets', 'hands', 'clothing', 'patronage', 'amulet', 'ring', 'potion', 'scroll', 'rod', 'rune'];

		for(var i in equipmentTypes) {
			var type = equipmentTypes[i];
			var accept = {accept: '#widgets [equipment-type=' + type + ']'};
			$('#widgets .equipment .' + type + '[droppable=true]').droppable(options.droppable, accept);
		}

		$('#widgets .warehouse [droppable=true], #widgets .backpack [droppable=true]').droppable(options.droppable, {accept: '#widgets [item-id]'});
		 /*
		var skillsOptions = options.droppable;
			skillsOptions.accept = '#widgets [skills=true]';
			skillsOptions.drop = function(event, ui){

			var dropZone = this;
			var dragEl = ui.draggable;
			console.log('dnd skills');

			dndItemExchange( dropZone, dragEl );
			sendItemExchange();
		}
		$('#widgets .skills [droppable=true]').not('.disable').droppable(skillsOptions);
		*/
	};

	//page functions
	var baseFunct = function() {
		$('form.socket').submit(function(){
			var form = this;
			var action = $(this).attr('action');
			var data = {};

			$(form).find('input[type=text], input[type=email], input[type=hidden]').each(function(indx, element){
				var name = $(element).attr('name');
				var value = $(element).val();

				data[name] = value;
			});

			socket.emit(action, data);

			return false;
		});

		$('form.widget').submit(function(){
			var form = this;
			var action = $(this).attr('action');
			var data = {};

			$(form).find('input[type=text], input[type=email], input[type=hidden]').each(function(indx, element){
				var name = $(element).attr('name');
				var value = $(element).val();

				data[name] = value;
			});

			var functName = 'widget' + action.charAt(0).toUpperCase() + action.slice(1);
			eval(functName + '(form, data)');

			return false;
		});

		$('form.bookmark').submit(function(){
			var name = $(this).attr('action');
			setBookmark(name);
			return false;
		});
	}


	var refresh = function(mapType) {
		baseFunct();
		setUi();
		setDnD();
	}

	var battleFunct = function() {

	}

	socket.on('bookmark', function(data){
		if( debug.log ) { console.log( 'socket bookmark ' + data.name ); }
		setBookmark(data.name);
	});

	var setBookmark = function(name) {
		var select = '.bookmark.' + name;
		$('#wrapper div.bookmark').hide();
		$(select).show();
	}

	var setActiveWindows = function( name ) {
		if( debug.log ) { console.log( 'windows ' + name ); }
		$('#wrapper .windows').hide();
		$('#' + name).show();
	}

	//Widget functions
	var widgetShow = function(form, data) {
		var widgetName = data.widget;
		var widgets = $('#widgets .widget').css({zIndex:500});
		var widget = $(widgets).filter('.' + widgetName);


		var templateHeight = $('#template').height();
		var widgetHeight = $(widget).height();

		var templateWidth = $('#template').width();
		var widgetWidth = $(widget).width();

		var marginLeft = (templateWidth - widgetWidth) / 2;
		var marginTop = (templateHeight - widgetHeight) / 2;

		console.log(templateHeight, marginTop, (templateHeight / 2) < marginTop);
		if( (templateHeight / 3) < marginTop ) {
			marginTop = marginTop * 0.5
		}

		var margin = marginTop + 'px ' + marginLeft + 'px';

		$(widget).css({zIndex:1000, margin: margin}).show();
	}

	var widgetHide = function(form, data) {
		var condition = '.widget';

		if( data.widget ) {
			condition += '.' + data.widget;
		}
		$(form).parents( condition ).hide();
	}


	//sockets
	socket.on('template', function(data){
		$('#template').html(data.template);
		if( debug.log ) { console.log( 'template' ); }

		if(data.bookmark) {
			console.log( 'template bookmark ' + data.bookmark );
			setBookmark(data.bookmark)
		}
		refresh(data.type);
	});

	//battle
	socket.on( 'battle/init', function( data){
		if( debug.log) { console.log( 'socket battle/init ', data);}

		var teamsEl = $( '#battle .team');

		var teams = data.forces;


		//create and show team`s character
		var createTeam = function( team, side, position) {

			var maxTeam = options.battle.teamInSide;

			var teamIdx = ( maxTeam * side) + options.battle.teamElIdx[position];
			var teamEl = $( teamsEl).eq( teamIdx).find( '.ui-character');

			var createCard = function( teamEl, character, position) {
				var characterEl = $( teamEl).eq( position);

				var countersEl = $( characterEl).find( '.ui-counter')
				$( countersEl).data( { uid: character.id});


				for( var idx in options.battle.counters) {
					var name = options.battle.counters[idx];

					if( character.counters[name] ) {
						var counterCur = character.counters[name];
					} else {
						var counterCur = character.stat[name];
					}

					var counterEl = $( countersEl).filter('[name="' + name + '"]')

					$( counterEl).find( '.label div')
						.eq(0).html( counterCur)
						.end().eq(2).html( character.stat[name])

					updateUiCounterBar( counterEl);
				}

				$( characterEl).data( { uid: character.id});
				$( characterEl).find( 'h3').html( character.profile.username);

				var avatar = $( characterEl).find( '.ui-avatar');
				$( avatar).data( { item: character.profile.avatar, gender: character.profile.gender, race: character.profile.race});

				setUiAvatar( avatar);

				$( characterEl).show();
			}


			for( var characterIdx in team.team) {
				var character = team.team[characterIdx];

				if( typeof character == 'object') {
					createCard( teamEl, character, characterIdx);
				}
			}
		}

		//detect user team and del unactive team
		for ( var teamIdx in teams) {
			var team = teams[teamIdx];

			if( team.uid == store.uid) {
				createTeam( team, 1, 0);  // '1 side' is at the bottom of the screen, this is user side position
				var userSide = team['side'];
				delete( teams[teamIdx]);
			} else if( team.status != 'active') {
				delete( teams[teamIdx]);
			}
		}

		var sidePosition = [0, 1]; // sidePosition[0] = 1 is user position

		for ( var teamIdx in teams) {
			var team = teams[teamIdx];

			if( team.side == userSide) {
				var side = 1
			} else {
				var side = 0
			}


			if(  team.team) {
				createTeam( team, side, sidePosition[side]);
			}
			sidePosition[side]++;
		}

		setActiveWindows( 'battle');
	});

	socket.on('battle/escape', function( data ){
		if( debug.log ) { console.log( 'socket battle/escape ', data ); }
		setActiveWindows('template');
		setBookmark('finish');
		delete(store.battle);
	});

	socket.on('battle/cancel', function( data ){
		if( debug.log ) { console.log( 'socket battle/cancel ', data ); }
		console.log( 'socket battle/cancel ', data );
		setBookmark('main');
	});


	var store = {};
	socket.on('store/set', function(data){
		if( debug.log ) { console.log( 'store/set ', data ); }
		for(var idx in data) {
			store[idx] = data[idx];
		}
	});
});
