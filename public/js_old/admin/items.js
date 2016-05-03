$(document).ready(function() {
	var debug = {
		log: false
	}

	var typeList = {
		bracelets : {
			'gray' : { 'base-stats' : ['armor', 'block_rate', 'adrenaline'] }
		}
		,hands : {
			'gray' : { 'base-stats' : ['attack'] }
		}
		,clothing : {
			'gray' : { 'base-stats' : ['armor'], 'additional-options' : ['light_armor'] }
		}
		,patronage : {
			'gray' : { 'additional-options' : ['extra_slots'] }
		}
		,amulet : {
			'gray' : { 'base-stats' : ['energy'] }
		}
		,ring : {
			'gray' : { 'base-stats' : ['health_point', 'attack', 'armor', 'resistance', 'dodge_rate', 'block_rate', 'critical_rate', 'energy', 'adrenaline'] }
		}
		,potion : {}
		,scroll : {}
		,rod : {}
		,rune : {}
		,quest : {}
		,other : {}
	}

	//Item
	$('#type').change(function(){
		$(this).parents('form').find('.options').hide();

		var type = $(this).val();
		var quality = $('#quality').val();

		var options = typeList[type][quality];

		if( debug.log ) { console.log('select type: ', type, ', quality: ', quality) }

		for(var id in options) {

			for(var idx in options[id]) {
				var name = options[id][idx];
				$('#' + id + ' .' + name).show();
			}
		}

	}).change();

	$('#quality').change(function(){
		$('#type').change();
	});
});