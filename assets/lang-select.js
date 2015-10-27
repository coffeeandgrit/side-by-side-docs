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

    $('.navigation a')
        .first()
        .addClass('active');
});
