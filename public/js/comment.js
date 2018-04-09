$(function () {
    var perpage = 4;
    var page =1;
    var pages=0
    var comments =[]

    // 提交评论
    $('#messageBtn').on('click',function(){
        $.ajax({
            type:'POST',
            url:'/api/comment/post',
            data:{
                contentId:$('#contentId').val(),
                content:$('#messageContent').val()
            },
            success:function (responseData) {
                content:$('#messageContent').val("")
                comments=responseData.data.comments.reverse()
                renderComment()
            }
        })
    });
    $.ajax({
        type:'GET',
        url:'/api/comment/get',
        data:{
            contentId:$('#contentId').val(),
        },
        success:function (responseData) {
            comments = responseData.data.comments.reverse()
            renderComment()
        }
    });

    $('.pager').delegate('a','click',function () {
        if($(this).parent().hasClass('previous')){
            page--;
            renderComment()
        }else{
            page++
            renderComment()
        }
    });

    function renderComment(){
        $('#messageCount').html(comments.length)

        pages = Math.ceil(comments.length/perpage)
        var start = Math.max(0,(page-1)*perpage)
        var end = Math.min(start+perpage,pages)
        var $lis = $('.pager li')
        $lis.eq(1).html(page+'/'+pages)

        if(page<=1){
            page=1
            $lis.eq(0).html('<span>没有上一页了</span>')
        }else{
            $lis.eq(0).html('<a style="cursor: pointer">上一页</a>')
        }
        if(page>=pages){
            page=pages
            $lis.eq(2).html('<span>没有下一页了</span>')
        }else{
            $lis.eq(2).html('<a style="cursor: pointer">下一页</a>')
        }

        var html  = ""
        for(var i = start ;i<end;i++){
            html += "<div class=\"messageList\" style=\"display: block;\">\n" +
                "            <div class=\"messageBox\">\n" +
                "                <p class=\"name clear\"><span class=\"fl\">"+comments[i].username+"</span><span class=\"fr\">"+format(comments[i].postTime)+"</span></p><p>"+comments[i].content+"</p>\n" +
                "            </div>\n" +
                "        </div>"
        }
        $(".messageList").html(html)
    }
    function format(d){
        var date =  new Date(d)
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+
            date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    }
});
