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

                var collidedTarget = collided(stage, copyElement);
                settings.onMove(element, collidedTarget);
            });

            $(document).mouseup(function cancelStopDrag(){
                if(stage){
                    var collidedTarget = collided(stage, copyElement);
                    if(collidedTarget){
                        var e = element.clone();
                        copyCss(element, e);
                        collidedTarget.append(e);
                        element.hide();
                        settings.onCollide(element, collidedTarget);
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

function collided(target, element){
    var collidedTarget = undefined;
    $(target).each(function(){
        var staticInitX = $(this).offset().left;
        var staticEndX = staticInitX + $(this).outerWidth();
        var staticInitY = $(this).offset().top;
        var staticEndY = staticInitY + $(this).outerHeight();

        var portableInitX = element.offset().left;
        var portableEndX = portableInitX + element.outerWidth();
        var portableInitY = element.offset().top;
        var portableEndY = portableInitY + element.outerHeight();

        var colidedInX = (portableInitX >= staticInitX && portableInitX <= staticEndX) ||
            (portableEndX >= staticInitX && portableEndX <= staticEndX);

        var colidedInY = (portableInitY >= staticInitY && portableInitY <= staticEndY) ||
            (portableEndY >= staticInitY && portableEndY <= staticEndY);

        if(colidedInX && colidedInY){
            collidedTarget = $(this);
            return false;
        }
    });

    return collidedTarget;
}
