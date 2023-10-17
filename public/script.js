const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;

Swal.fire({
  title: ` <div class='title-username-modal'><span>WELCOME TO LiveLink</span></div>
    <div class='username-modal-container'>
    </div>
    <span class="captcha-title"> Verify you are not a robot  </span>
    <div class='main__captcha'>

        <p class="captcha-code" id='key'></p>
        <input class='captcha-input' type='text' id='submit' placeholder='Insert Captcha' />
        <button class="verify-button" id='btn' onclick='printmsg()'>Verify</button>
        <div class='inline' onclick='generate()'><i id="refresh-icon"class='fas fa-sync'></i></div>
    </div>
    <p class="error-captcha" id="error-message"></p>
    <span class="input-title">Enter your username to join the call!</span>
    `,
  input: "text",
  inputAttributes: {
    autocapitalize: "off",
  },
  showCancelButton: false,
  confirmButtonText: "Submit",
  allowOutsideClick: false,
  preConfirm: async () => {
    const userInput = document.getElementById("submit").value;
    const captchaKey = document.getElementById("key").textContent;
    const usernameInput = Swal.getInput().value;

    if (userInput === captchaKey && usernameInput) {
      return usernameInput; // Il captcha è verificato e l'username è inserito, permetti di chiudere la modale
    } else {
      if (!usernameInput) {
        // Mostra un messaggio di errore se l'username non è inserito
        Swal.showValidationMessage("Please enter your username");
      } else {
        // Mostra un messaggio di errore se il captcha è sbagliato
        document.getElementById("error-message").textContent =
          "Insert Captcha, please !";
      }
      return false; // Impedisce la chiusura della modale
    }
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
        logVideoStreamInfo(stream);

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
        <b><i class="fa fa-user" aria-hidden="true"></i><span> ${
          userName === user ? "me" : userName
        }</span> </b>
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

function generate() {
  const captchaLength = 5; // Lunghezza del captcha
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";

  for (let i = 0; i < captchaLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    captcha += characters[randomIndex];
  }

  // Mostra il captcha nell'elemento con id "key"
  document.getElementById("key").textContent = captcha;
}

// Chiama la funzione generate() subito all'avvio dello script
generate();

// Verifica il captcha
function printmsg() {
  const userInput = document.getElementById("submit").value;
  const captchaKey = document.getElementById("key").textContent;
  const errorMessage = document.getElementById("error-message");

  if (userInput === captchaKey) {
    errorMessage.textContent = "Captcha correct !";
  } else {
    errorMessage.textContent = "Wrong Captcha, please try again !";
  }
}

function logVideoStreamInfo(stream) {
  const logs = [];

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

  const logText = logs.join("\n");
  console.log(logText);

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
