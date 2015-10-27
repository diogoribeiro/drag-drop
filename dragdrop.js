(function drag($){
    $.fn.drag = function(options){
        var doNothing = function doNothing(){}
        var optionsDefault = {
            onDrag: doNothing, //event handled when drag starts. It'll pass the element as an argument.
            onCollide: doNothing, //event handled when drag starts. It'll pass the draggable element and the stage element as an argument.
            onMove: doNothing, //event handled when moving element. It'll pass the draggable element and a bol telling if the element is on stage.
            afterDrag: doNothing //event handled when drag finish.
        }

        var settings = $.extend(optionsDefault, options);
        this.css({
            cursor: "pointer"
        });

        var dragElement = function(element, click){
            var stage = $(settings.stage);
            var copyElement = element.clone();
            copyCss(element, copyElement);
            copyElement.css({
                position: "absolute",
                left: click.pageX - (copyElement.width()/2),
                top: click.pageY - (copyElement.height()/2)
            });

            $(document).mousemove(function moveDragable(event){
                var left = event.pageX - (copyElement.width()/2);
                var top = event.pageY - (copyElement.height()/2);
                copyElement.css({
                    position: "absolute",
                    left: left,
                    top: top
                });

                settings.onMove(element, collided(stage, copyElement));
            });

            $(document).mouseup(function cancelStopDrag(){
                if(stage){
                    if(collided(stage, copyElement)){
                        var e = element.clone();
                        copyCss(element, e);
                        stage.append(e);
                        element.hide();
                        settings.onCollide(element, stage);
                    }

                    copyElement.remove();
                } else {
                    element.hide();
                }

                $(document).off("mousemove");
                $(document).off("mouseup");

                settings.afterDrag();
            });

            copyElement.appendTo("body");
        }

        return this.children().on('mousedown', function clickDragable(event){
            event.preventDefault();
            settings.onDrag($(this));
            dragElement($(this), event);
        });
    }
})(jQuery);

function copyCss(sourceElement, targetElement) {
    var sourceCssProperties = window.getComputedStyle(sourceElement[0], null);

    for(var i=0; i< sourceCssProperties.length; i++){
        var style = sourceCssProperties[i];
        targetElement.css(style, sourceCssProperties.getPropertyValue(style));
    }
}

function collided(staticElement, portableElement){
    var staticInitX = staticElement.offset().left;
    var staticEndX = staticInitX + staticElement.outerWidth();
    var staticInitY = staticElement.offset().top;
    var staticEndY = staticInitY + staticElement.outerHeight();

    var portableInitX = portableElement.offset().left;
    var portableEndX = portableInitX + portableElement.outerWidth();
    var portableInitY = portableElement.offset().top;
    var portableEndY = portableInitY + portableElement.outerHeight();

    var colidedInX = (portableInitX >= staticInitX && portableInitX <= staticEndX) ||
        (portableEndX >= staticInitX && portableEndX <= staticEndX);

    var colidedInY = (portableInitY >= staticInitY && portableInitY <= staticEndY) ||
        (portableEndY >= staticInitY && portableEndY <= staticEndY);

    return colidedInX && colidedInY;
}
