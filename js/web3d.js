

function getWeb3d(){
    web3d_ide=$("#web3d-ide");
    canvas=web3d_ide.find("#web3d-ide-canvas");
    canvas.width = 1024;
    canvas.height = 768;
    form=web3d_ide.find('#form-div');
    ctx= canvas[0].getContext("2d");

    loadGeneralConf();
    form.prepend(getPluginSelect());
    scale = 1;


    for (var n=0;n<backgrounds.length;n++){
        //points.push(new Array());
    }
    setBackground(cur_z);
    eventsManager();
}

function getPluginSelect(){
    var out='<select id=\"web3d_plugins\">';
    out+='<option value="s">Select..</option>';
    for (var n=0;n<plugins.length;n++) {
        out+='<option value="'+n+'">'+plugins[n].toString()+'</option>';
    }
    out+='</select>';
    return out;
}


//  Funzione che mi setta il background della canvas. Ci servirà utile al fine di prendere i vari slice del DICOM
function setBackground(i) {
    clearCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    linewidth=1;
    var img = new Image();
    img.onload = function(){
        ctx.drawImage(img, 0, 0, backgrounds[i].getWidth(), backgrounds[i].getHeight());
    }
    img.src = backgrounds[i].getImg();
}

//Serve a caricare
function loadGeneralConf(){
    web3d_ide.find('img').each(function(){
        var slice=new Slice();
        slice.setImg($(this).attr('src'));
        slice.setHeight($(this).attr('width'));
        slice.setWidth($(this).attr('height'));
        backgrounds.push(slice);
    })
}

function getNumberPoints(){
    return n_points;
}

getWeb3d();

function getLastPoint(){
    var cur_set=cur_plugin.getCurSet();
    return cur_set[cur_set.length-1];
}


function eventsManager(){
    $('.actions').live('click',function(){
        cur_action=$(this).val();
        if (cur_action=='drag')
            canvas.css('cursor', 'pointer');
        else if (cur_action=='draw')
            canvas.css('cursor', 'crosshair');
        else
            canvas.css('cursor', 'auto');
    });

    $('.selectFrame').live('click',function(){
        cur_z=cur_z+parseInt($(this).val());
        $('#curFrame').val(cur_z);
        $('.selectFrame').removeAttr("disabled", "disabled");
        if (cur_z==0)
            $(this).attr("disabled", "disabled");

        if (cur_z==backgrounds.length-1)
            $(this).attr("disabled", "disabled");

        setBackground(cur_z);
        drawAll();
    });

    $("#web3d_plugins").live("change",function(){
        if ($(this).val()!='s'){
            cur_plugin=plugins[$(this).val()];
            $(this).find("option[value=s]").remove();
        }
    });

    canvas.live('click', function(event) {
        switch (event.which) {
            case 1:
                leftClick(event);
                break;
            case 2:
                middleClick(event);
                break;
            case 3:
                rightClick(event);
                break;
            default:
                alert('You have a strange mouse');
        }
    });

    canvas.live('dblclick', function(event) {
        if (cur_plugin){
            if (cur_action=='draw') {
                cur_plugin.removeLast();
                cur_plugin.endSet();
            }
        }
    });
}

function leftClick(event){
    if (cur_plugin){
        if (cur_action=='draw') {
            var pt=ctx.transformedPoint(event.offsetX , event.offsetY);
            var inserted=cur_plugin.addPoint(new Point(pt.x,pt.y,cur_z));
            if (!inserted){
                alert("No more points for this tool.");
            }
        }
        if (cur_action=='delete') {
            deletePoint(event.offsetX , event.offsetY);
        }
    }
    if (cur_action=='edit') {
        selectPoint(event.offsetX , event.offsetY);
    }
}



function middleClick(event){

}

function drawAll(){
    clearCanvas();

    var img = new Image();
    img.onload = function(){
        ctx.drawImage(img, 0, 0, backgrounds[cur_z].getWidth(), backgrounds[cur_z].getHeight());
        ctx.lineWidth = linewidth;
        for (var n=0;n<plugins.length;n++){
            plugins[n].draw();

            var tmp=plugins[n].getSets();
            for (var i=0;i<tmp.length;i++){
                var tmp2=tmp[i];
                for (var z=0;z<tmp2.length;z++){
                    tmp2[z].draw();
                }
            }
        }
    }
    img.src = backgrounds[cur_z].getImg();


}

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


function clearCanvas(){
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}
