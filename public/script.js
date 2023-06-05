const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

Swal.fire({
  title:
    "<div class='title-username-modal'><span>WELCOME TO LiveLink</span></div><div class='username-modal-container'><span> <br> Enter your username to join the call !</div>",
  input: "text",
  inputAttributes: {
    autocapitalize: "off",
  },
  showCancelButton: false,
  confirmButtonText: "Submit",
  allowOutsideClick: false,
  preConfirm: (name) => {
    if (!name) {
      Swal.showValidationMessage("Please enter your name");
    }
    return name;
  },
}).then((result) => {
  if (result.isConfirmed) {
    const user = result.value;

    var peer = new Peer({
      host: window.location.hostname,
      port:
        window.location.port ||
        (window.location.protocol === "https:" ? 443 : 80),
      path: "/peerjs",
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
      debug: 3,
    });

    let myVideoStream;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);
        console.log(
      "Video resolution:",
      stream.getVideoTracks()[0].getSettings().width,
      "x",
      stream.getVideoTracks()[0].getSettings().height)
	
	console.log(
	  "Frequenza fotogrammi:",
	  stream.getVideoTracks()[0].getSettings().frameRate);
	  
	console.log(
	  "Device id:",
	  stream.getVideoTracks()[0].getSettings().deviceId);
	 
	console.log(
	  "Formato:",
	  stream.getVideoTracks()[0].getSettings().aspectRatio);
	  
	console.log(
	  "Audio Latency:",
	  stream.getAudioTracks()[0].getSettings().latency, "seconds");
	  
	console.log(
	  "Noise suppression:",
	  stream.getAudioTracks()[0].getSettings().noiseSuppression);
	  
	console.log(
	  "Quality audio:",
	  stream.getAudioTracks()[0].getSettings().sampleSize, "bits");

        peer.on("call", (call) => {
          console.log("someone call me");
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
            console.log(
      "Video resolution:",
      stream.getVideoTracks()[0].getSettings().width,
      "x",
      stream.getVideoTracks()[0].getSettings().height)
	
	console.log(
	  "Frequenza fotogrammi:",
	  stream.getVideoTracks()[0].getSettings().frameRate);
	  
	console.log(
	  "Device id:",
	  stream.getVideoTracks()[0].getSettings().deviceId);
	 
	console.log(
	  "Formato:",
	  stream.getVideoTracks()[0].getSettings().aspectRatio);
	  
	console.log(
	  "Audio Latency:",
	  stream.getAudioTracks()[0].getSettings().latency, "seconds");
	  
	console.log(
	  "Noise suppression:",
	  stream.getAudioTracks()[0].getSettings().noiseSuppression);
	  
	console.log(
	  "Quality audio:",
	  stream.getAudioTracks()[0].getSettings().sampleSize, "bits");
          });
        });

        socket.on("user-connected", (userId) => {
          connectToNewUser(userId, stream);
        });
      });

    const connectToNewUser = (userId, stream) => {
      console.log("I call someone" + userId);
      const call = peer.call(userId, stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    };

    peer.on("open", (id) => {
      console.log("my id is" + id);
      socket.emit("join-room", ROOM_ID, id, user);
    });

    const addVideoStream = (video, stream) => {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
      });
    };

    let text = document.querySelector("#chat_message");
    let send = document.getElementById("send");
    let messages = document.querySelector(".messages");

    send.addEventListener("click", (e) => {
      if (text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
      }
    });

    text.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
      }
    });

    const inviteButton = document.querySelector("#inviteButton");
    const muteButton = document.querySelector("#muteButton");
    const stopVideo = document.querySelector("#stopVideo");
    muteButton.addEventListener("click", () => {
      const enabled = myVideoStream.getAudioTracks()[0].enabled;
      if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash"></i>`;
        muteButton.classList.toggle("clicked");
        muteButton.innerHTML = html;
      } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone"></i>`;
        muteButton.classList.toggle("clicked");
        muteButton.innerHTML = html;
      }
    });

    stopVideo.addEventListener("click", () => {
      const enabled = myVideoStream.getVideoTracks()[0].enabled;
      if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("clicked");
        stopVideo.innerHTML = html;
      } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle("clicked");
        stopVideo.innerHTML = html;
      }
    });

    inviteButton.addEventListener("click", (e) => {
      Swal.fire({
        title: "Send this link to people you want to meet with",
        text: window.location.href,
        icon: "info",
        confirmButtonText: "OK",
        position: "center",
        allowOutsideClick: false,
      });
    });

    socket.on("createMessage", (message, userName) => {
      messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
        <b><i class="fa fa-user" aria-hidden="true"></i><span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
    });

    // Hide-show chat function

    var toggleButton = document.getElementById("toggleButton");
    const endCallButton = document.getElementById("endCallButton");

    var sidebar = document.getElementById("sidebar");

    toggleButton.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });

    // Change color to chat button when clicked

    var toggleButton = document.getElementById("toggleButton");

    toggleButton.addEventListener("click", function () {
      toggleButton.classList.toggle("clicked");
    });
    endCallButton.addEventListener("click", () => {
      // stop the connction
      peer.destroy();

      // Remove all the videos from videoGrid
      const videos = document.querySelectorAll("#video-grid video");
      videos.forEach((video) => video.remove());

      // Hide videoGrid section
      videoGrid.style.display = "none";
    });
  }
});
