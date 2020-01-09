(function(){
		let drawing = false;
        const socket = io();
        
        const _canvas = document.getElementById('canvas');
        const _ctx = _canvas.getContext('2d');
        const _div = document.getElementById('images');
        const _clearAll = document.getElementById('ClearAll');
        const _saveImg = document.getElementById('SaveAsImg');
        const _color = document.getElementById('Color');
        const _lineWeight = document.getElementById('LineWeight');

        const currentPos = {}
        
        _saveImg.addEventListener('click', saveImg)
        _clearAll.addEventListener('click', clearCanvas)
        
        _canvas.addEventListener('mousedown', (e) => onmousedown(e))
        _canvas.addEventListener('mousemove', (e) => onmousemove(e))
        _canvas.addEventListener('mouseup', (e) => drawing = false)

        _canvas.addEventListener('touchstart', (e) => onmousedown(e))
        _canvas.addEventListener('touchmove', (e) => onmousemove(e))
        _canvas.addEventListener('touchend', (e) => drawing = false)
		
        socket.on('connected', console.log);
        socket.on('clear-canvas', () => _canvas.width = _canvas.width);
        socket.on('save-image', (newImage) => {
            _div.innerHTML = _div.innerHTML + newImage;
            _canvas.width = _canvas.width;
        });
        socket.on('draw-start', (data) => _ctx.beginPath());
        socket.on('drawing', ({currentPos, newPos, lineWidth, strokeStyle}) => {
            emitDraw(null, currentPos, newPos, lineWidth, strokeStyle)
        });
    
        function onmousedown(e){
            const x = xPos(e);
            const y = yPos(e);
            currentPos.x = x;
            currentPos.y = y;
            drawing = true;
            
            e.preventDefault();
        };

        function onmousemove(e){
            if(drawing){
                const x = xPos(e);
                const y = yPos(e);
                emitDraw('drawing', currentPos, {x, y}, _lineWeight.value, _color.value);
                currentPos.x = x;
                currentPos.y = y;
            }
        };

        function emitDraw(name, currentPos, newPos, lineWidth, strokeStyle){
            _ctx.beginPath();
            _ctx.moveTo(currentPos.x, currentPos.y);
            _ctx.lineTo(newPos.x, newPos.y);
            _ctx.strokeStyle = strokeStyle;
            _ctx.lineWidth = lineWidth;
            _ctx.stroke();
            _ctx.closePath();

            if(name){
                socket.emit(name, { currentPos, newPos, lineWidth, strokeStyle });
            }
        }
        
        function clearCanvas(){
            _canvas.width = _canvas.width;
            socket.emit('clear-canvas', 'Cleared')
        };
        
        function saveImg(){
            var _savedImg = _canvas.toDataURL("image/png");
            var _newImg = '<div><img src="' + _savedImg + '" width="200" height="100" /><div>';
            _div.innerHTML = _div.innerHTML + _newImg;
            socket.emit('save-image', _newImg);
            _canvas.width = _canvas.width;
        };
		
		function xPos(evt){
			return (evt.pageX || evt.touches[0].pageX) - _canvas.offsetLeft;;
		};
		function yPos(evt){
			return (evt.pageY || evt.touches[0].pageY) - _canvas.offsetTop;
		};
}())