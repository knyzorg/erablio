

var isAnimating = false;
$(window).blur(function () {
    $("#alttab").val(1);
})


$('body').on('click', '.science', function (event) {
    $("#answer").val($(this).data('option'));
    //detect which page has been selected
    //var newPage = $(this).attr('href') + "?a=" + $(this).data('option') + "&q=" + $("#qid").val();

    eval($("#data_inject").html())


    $("form").ajaxSubmit();

    if (data.answer != $(this).data('option')) {
        $(this).addClass("nay");
        $("#answered").prepend("<p class='explain'>" + data.wrong + "</p>");
    } else {
        $("#answered").prepend("<p class='explain'>" + data.right + "</p>");
    }
    $(".science").eq(data.answer).addClass('yay');

    $(".science").removeClass('science');
    $(".explain").html($(".explain").html().replace(/(?:\r\n|\r|\n)/g, '<br />'))
    $("#answered").fadeIn(500, "swing", function () {
        $("body").animate({ scrollTop: $(document).height() }, "slow");
    });

    //if the page is not already being animated - trigger animation
    //if( !isAnimating ) changePage(newPage, true);
    //firstLoad = true;
});

$('body').on('click', '[data-type="page-transition"]', function (event) {
    event.preventDefault();
    //detect which page has been selected
    var newPage = $(this).attr('href');
    //if the page is not animating - trigger animation
    if (!isAnimating) {
        changePage(newPage, true);
        console.log("Changing page");
    } else {


    }

});

function changePage(url, bool) {
    isAnimating = true;
    // trigger page animation
    $('body').addClass('page-is-changing');
    //...
    loadNewContent(url, bool);
    //...
}

function loadNewContent(url, bool) {
    var newSectionName = 'cd-' + url.replace('.html', ''),
        section = $('<div class="cd-main-content ' + newSectionName + '"></div>');

    section.load(url + ' .cd-main-content > *', function (event) {
        // load new content and replace <main> content with the new one
        $('main').html(section);
        //...
        setTimeout(function () {

            $('body').removeClass('page-is-changing');

        }, 1000);
        //...
        isAnimating = false;
        if (url != window.location) {
            //add the new page to the window.history
            window.history.pushState({ path: url }, '', url);
        }
    });
}

$(window).on('popstate', function () {
    var newPageArray = location.pathname.split('/'),
        //this is the url of the page to be loaded 
        newPage = newPageArray[newPageArray.length - 1];
    if (!isAnimating) changePage(newPage);
});