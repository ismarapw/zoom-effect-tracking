const {useState, useEffect} = React;

function App() {
	
	// Canvas atributes
	const [mouseX, setMouseX] = useState(0);
	const [mouseY, setMouseY] = useState(0);
	const [drawRect, setDrawRect] = useState(false);

	// render process atribute
	const [isRender, setIsRender] = useState(false);
	const [downloadFile, setDownloadFile] = useState(null);
	
	// video file atributes
	const [vidInput, setVidInput] = useState(null);
	const [firstFrame, setFirstFrame] = useState(null);
	const [isInvalidMeta, setIsInvalidMeta]= useState(false);
	const [vidProperty, setVidProperty] = useState({
		width : 0,
		height : 0,
		aspectRatio : 0
	});
	const [bbox, setBbox] = useState({
		x : 0,
		y : 0,
		w : 0,
		h : 0
	});

	// Hooks for accepted input
	useEffect(() => {
		if (vidInput) {
			// draw a first frame on canvas based on container size
			const canvas = document.querySelector('canvas');
			const ctx = canvas.getContext('2d');
			const container = document.querySelector('.container');
			const video = document.createElement('video');

			video.src = vidInput;
			video.autoplay = true;
			video.addEventListener('loadeddata', () => {
				const vidWidth = video.videoWidth;
				const vidHeight = video.videoHeight;
				const aspectRatio = vidWidth / vidHeight;
				canvas.width = container.getBoundingClientRect().width;
				canvas.height = canvas.width / aspectRatio;
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				video.pause();
				setFirstFrame(video);
				setVidProperty({
					width : vidWidth,
					height : vidHeight,
					aspectRatio : aspectRatio
				})
			});
		}
	}, [vidInput]);


	// Resized window hooks
	useEffect(() => {
		if (firstFrame){
			// Redraw/Recreate firstframe on canvas based on new width of container
			window.addEventListener('resize', ()=> {
				const container = document.querySelector('.container');
				const canvas = document.querySelector('canvas');
				const ctx = canvas.getContext('2d');

				canvas.width = container.getBoundingClientRect().width;
				canvas.height = canvas.width / vidProperty.aspectRatio;

				ctx.drawImage(firstFrame, 0, 0, canvas.width, canvas.height);
			})
		}
	},[firstFrame, vidProperty])

	// handle selected files
	const handleInput = (e) => {
		e.preventDefault();
		
		// Check wheter the video format and resolution is valid
        const file = e.target.files[0];
		
		if (file.type !== 'video/mp4') {
			setIsInvalidMeta(true);
			e.target.value = "";
			return  
		}
		
		const minWidth = 1280
		const minHeight = 720
        const url = URL.createObjectURL(file);
		const video = document.createElement('video');

		video.src = url;
		video.addEventListener('loadedmetadata', () => {
			const vidWidth = video.videoWidth;
			const vidHeight = video.videoHeight;
			
			if (vidWidth < minWidth || vidHeight < minHeight){
				setIsInvalidMeta(true);
				e.target.value = "";
				setVidInput(null)
			}else {
				setIsInvalidMeta(false);
				setVidInput(url);
			}
		})
    };

	// handle canvas if mouse clicked
	const canvasMouseDown = (e) => {
		// set the coordinate of the mouse relative to canvas box
		const canvas = document.querySelector('canvas');
		
		setDrawRect(true)
		setMouseX(e.clientX - canvas.getBoundingClientRect().left)
		setMouseY(e.clientY - canvas.getBoundingClientRect().top)
	}
	
	// handle canvas if mouse is moved
	const canvasMouseMove = (e) => {
		if (drawRect) {
			// draw bounding box based on mouse position
			const canvas = document.querySelector('canvas');
			const ctx = canvas.getContext("2d");
			const newWidth = (e.clientX - canvas.getBoundingClientRect().left) - mouseX
			const newHeight = (e.clientY - canvas.getBoundingClientRect().top) - mouseY
			ctx.drawImage(firstFrame, 0, 0, canvas.width, canvas.height);
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.rect(mouseX, mouseY, newWidth, newHeight);
			ctx.strokeStyle = "#ff0000";
			ctx.stroke();

			setBbox({
				x : parseFloat((mouseX / canvas.width) * vidProperty.width).toFixed(2),
				y : parseFloat((mouseY / canvas.height) * vidProperty.height).toFixed(2),
				w : parseFloat((newWidth / canvas.width) * vidProperty.width).toFixed(2),
				h : parseFloat((newHeight / canvas.height) * vidProperty.height).toFixed(2),
			})
		}
	}	
	
	// handle canvas if mouse is unclicked
	const canvasMouseUp = (e) => {
		setDrawRect(false)
	}

	// handle submit video
	const handleSubmit = (e) => {
		e.preventDefault();
		
		// Try to check the firstframe form the video wheter is properly setup or not
		if (!firstFrame) {
			setIsInvalidMeta(true)
			return
		}

		//  Submit to flask server
		setIsRender(true);
		
		const formData = new FormData(e.target);
		
		fetch('/render', {
			method : 'POST',
			body : formData
		})
		.then(res => res.json())
		.then(data => {
			if(data.status === 200) {
				// show rendered files after complete
				setDownloadFile('http://127.0.0.1:5000/download/' + data.rendered_file);
				var myModal = new bootstrap.Modal(document.getElementById('resultModal'),{
					keyboard: false,
					backdrop: 'static'
				})
				
				myModal.show();
				setIsRender(false);

			}
		})
		.catch(err => console.log(err))
	} 
    
    return (
        <div className = 'container px-0 mt-3 py-4'>
			<div className = "text-center">
            	<h1>Hello Editors...</h1>
			</div>
			<form method = "POST" onSubmit = {handleSubmit} encType="multipart/form-data" className = 'w-d-flex flex-column justify-content-center items-center'>
				<div className="mb-3">
					<label htmlFor="formFile" className="form-label">Please Select yout video</label>
					<input required className="form-control" type="file" id="formFile" name = "vid_file" onChange = {handleInput}/>
				</div>
				{isInvalidMeta &&
				<p className = "text-center alert alert-danger">Vidoo file is not supported, use video with minimum 1280x720 resolution and mp4 format</p>
				}
				{vidInput &&
				<>
					<p className = "text-center alert alert-primary">Select the object you want to track by holding and dragging the mouse over the first video frame.</p>
					<div className = "vid-canvas">
						<canvas onMouseDown = {canvasMouseDown} onMouseMove = {canvasMouseMove} onMouseUp = {canvasMouseUp} id="myCanvas"/>
					</div>
				</>
				}
				<div className = "mt-3">
					<label htmlFor = "x">X coordinates</label>
					<input className = "form-control" id = "x" name = "x" value = {bbox.x} readOnly />
				</div>
				<div className = "mt-3">
					<label htmlFor = "y">Y coordinates</label>
					<input className = "form-control" id = "y" name = "y" value = {bbox.y} readOnly  />
				</div>
				<div className = "mt-3">
					<label htmlFor = "w">Width</label>
					<input className = "form-control" id = "w" name = "w" value = {bbox.w} readOnly />
				</div>
				<div className = "mt-3">
					<label htmlFor = "h">Height</label>
					<input className = "form-control" id = "h" name = "h" value = {bbox.h} readOnly />
				</div>
				<button className="btn btn-primary w-100 mt-4" type="submit" disabled = {isRender}>
					{isRender &&
					<div>
						<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
						<span className = "mx-2">Rendering, please wait ...</span>
					</div>
					}
					{!isRender &&
					<div>
						<span>Render</span>
					</div>
					}
				</button>
			</form>
			<div className = "modal fade" id="resultModal" tabIndex="-1" aria-labelledby="resultModalLabel" aria-hidden="true">
				<div className = "modal-dialog">
					<div className = "modal-content">
						<div className = "modal-header">
							<h5 className = "modal-title" id="resultModalLabel">Render Result</h5>
						</div>
						<div className = "modal-bod d-flex flex-column justify-content-center align-items-center p-2">
							<p className = 'alert alert-success w-100 text-center'>Your video successfully rendered</p>
							<video controls src= {downloadFile} type="video/mp4"></video>
						</div>
						<div className = "modal-footer d-flex justify-content-center flex-column align-items-center">
							<a href = {downloadFile} type="button" className = "btn btn-success w-100">Download</a>
							<button type="button" className = "btn btn-secondary w-100" data-bs-dismiss="modal" aria-label="Close">Close</button>
						</div>
					</div>
				</div>
			</div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
