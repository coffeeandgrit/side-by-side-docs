$(function() {
    console.log('adding lang select');

    $('div.selections a')
        .each(function(ix, val) {
            var $val = $(val);
            var toSelect = $val.text();
            console.log('setting up ' + toSelect);
            $val.click(function(e) {
                $('div.selections a.selection.active')
                    .each(function(ix, iv) {
                        $(iv)
                            .removeClass('active');
                    });
                $val.addClass('active');
                $('.code')
                    .each(function(ix, iv) {
                        $(iv)
                            .hide();
                    });
                $('.' + toSelect)
                    .each(function(ix, iv) {
                        $(iv)
                            .show();
                    });
            });
        });

    var defaultLanguage = $('div.selections a')
        .first()
        .text();
    console.log($('div.selections a')
        .first()
        .text());
    console.log('default lang: ' + defaultLanguage);
    $('.' + defaultLanguage)
        .each(function(ix, iv) {
            $(iv)
                .show();
        });
    $('div.selections a')
        .first()
        .addClass('active');
});

$(function() {
    $('.topic')
        .each(function(ix, iv) {
            new Waypoint({
                element: iv,
                handler: function(direction) {
                    console.log(this.element.id + ' from ' + direction);
                    if (!!$('.navigation a[href$="' + this.element.id + '"]')
                        .length) {
                        $('.navigation a')
                            .each(function(ix, iv) {
                                $(iv)
                                    .removeClass('active');
                            });
                        $('.navigation a[href$="' + this.element.id + '"]')
                            .addClass('active');
                    }
                },
                context: $('.documentation')
                    .get(0)
            });
        });

    $('.documentation').scroll(function(){
        Waypoint.enableAll();
    });

    $('.navigation a').click(function(event){
        console.log('clicked on %s', $(event.target).text());
        Waypoint.disableAll();
        $('.navigation a').each(function(ix, iv){
            $(iv).removeClass('active');
        });
        $(event.target).addClass('active');
    });

    $('.navigation a')
        .first()
        .addClass('active');
});

$(function(){
    var app = Sammy('body', function(){
        var self = this;
        self.get('/:topic/:lang?', function(context){
            context.params.lang = context.params.lang || $('div.selections a').first().text();
            $('.documentation').scrollTo('#'+context.topic);
        });
    });
});
