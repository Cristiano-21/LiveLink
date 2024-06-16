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
        peer.on("call", (call) => {
          console.log("someone call me");
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
            logVideoStreamInfo(userVideoStream);
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
        logVideoStreamInfo(userVideoStream);
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
        <span>${message}</span>
    </div>`;

      console.log("Message:", message);
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
    window.addEventListener("offline", function () {
      const errorMessageDiv = document.getElementById("error-container");
      errorMessageDiv.innerHTML =
        "<div class='message-error'> CONNECTION LOST </div><br><div class='message-error'> Please check your internet connection. </div>";
      errorMessageDiv.style.display = "block"; // Mostra l'elemento

      const videoGridDiv = document.getElementById("video-grid");
      videoGridDiv.style.display = "none"; // Nasconde il div "video-grid"
    });

    window.addEventListener("online", function () {
      const errorMessageDiv = document.getElementById("error-container");
      errorMessageDiv.style.display = "none"; // Nasconde l'elemento

      const videoGridDiv = document.getElementById("video-grid");
      videoGridDiv.style.display = "block"; // Mostra di nuovo il div "video-grid"

      const refreshButton = document.getElementById("refreshButton");
      if (refreshButton) {
        refreshButton.remove(); // Rimuove il bottone se presente
      }
    });
  }
});

function logVideoStreamInfo(stream) {
  const logs = [];

  const logText = logs.join("\n");
  console.log(logText);

  fetch("/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ logText }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Log sent successfully");
      } else {
        console.error("Failed to send log");
      }
    })
    .catch((error) => {
      console.error("Error sending log:", error);
    });

  const videoResolution =
    stream.getVideoTracks()[0].getSettings().width +
    "x" +
    stream.getVideoTracks()[0].getSettings().height;
  if (videoResolution !== "undefinedxundefined") {
    logs.push("Video resolution: " + videoResolution);
  }

  const frameRate = stream.getVideoTracks()[0].getSettings().frameRate;
  if (frameRate !== undefined) {
    logs.push("Frame rate: " + frameRate);
  }

  const audioLatency = stream.getAudioTracks()[0].getSettings().latency;
  if (audioLatency !== undefined) {
    logs.push("Audio Latency: " + audioLatency + " seconds");
  }

  const noiseSuppression = stream
    .getAudioTracks()[0]
    .getSettings().noiseSuppression;
  if (noiseSuppression !== undefined) {
    logs.push("Noise suppression: " + noiseSuppression);
  }


  // Write logs to a text file
  if (logs.length > 0) {
    const filename = "log.txt";
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(logText)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
