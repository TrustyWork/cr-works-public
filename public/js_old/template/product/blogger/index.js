$( document).ready( function(){

    $( '#category-input, #lang-input').change( function() {

        var category = $( '#category-input').val()
            ,lang = $( '#lang-input').val();

        var script = '<!-- Creative Works. Blogger widget BEGIN-->'
            + '<div id="cr-works-widget"></div>'
            + '<script type="text/javascript">'
            + '(function ( d, w) {'
            + '    var url = \'http://cr-works.net/api/blogger/widget/' + category + '/' + lang + '?\' + new Date().getTime()'
            + '        ,script = d.createElement( \'script\');'
            + '    script.src = url;'
            + '    d.body.appendChild( script);'
            + '})( document, window);'
            + '</script>'
            + '<!-- Creative Works. Blogger widget END -->'

        $( '#script-input').val( script);
    });
    $( '#category-input').change();
})