const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
function openLoginModal() {
  Swal.fire({
    html: `
      <div class='title-username-modal'><span>WELCOME TO LiveLink</span></div>
      <div class='username-modal-container'>
        <span class="input-title">Enter your username and password to log in!</span>
        <input id="loginUsernameInput" class="swal2-input" placeholder="Username">
        <input id="loginPasswordInput" class="swal2-input" type="password" placeholder="Password">
      </div>
      <span class="captcha-title"> Verify you are not a robot </span>
      <div class='main__captcha'>
        <p class="captcha-code" id='key'></p>
        <input class='captcha-input' type='text' id='loginCaptcha' placeholder='Captcha' />
        <button class="verify-button" id='btn' onclick='printmsg()'>Verify</button>
        <div class='inline' onclick='generate()'><i id="refresh-icon" class='fas fa-sync'></i></div>
      </div>
      <p class="error-captcha" id="loginErrorMessage"></p>
    `,
    showCancelButton: false,
    confirmButtonText: "log in",
    allowOutsideClick: false,
    preConfirm: async () => {
      const userInput = document.getElementById("loginCaptcha").value;
      const captchaKey = document.getElementById("key").textContent;
      const username = document.getElementById("loginUsernameInput").value;
      const password = document.getElementById("loginPasswordInput").value;

      if (!username) {
        Swal.showValidationMessage("Please enter your username");
        return false;
      }
      if (!password) {
        Swal.showValidationMessage("Please enter your password");
        return false;
      }
      if (userInput !== captchaKey) {
        document.getElementById("loginErrorMessage").textContent = "Insert Captcha, please!";
        return false;
      }

      return {
        username: username,
        password: password,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const user = result.value;

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      }).then(response => {
        if (!response.ok) {
          return Swal.fire("Login Error", "There was a problem with the login.", "error");
        }
      });

      // Additional actions after successful login...
    }
  });
}

// Funzione per validare l'email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Funzione per la gestione della seconda modale di login al click del bottone "log in" nella prima modale
Swal.fire({
  html: `
    <div class='title-username-modal'><span>WELCOME TO LiveLink</span></div>
    <div class='username-modal-container'>
      <span class="input-title">Enter your username, password, and email to join the call!</span>
      <input id="usernameInput" class="swal2-input" placeholder="Username">
      <input id="passwordInput" class="swal2-input" type="password" placeholder="Password">
      <input id="emailInput" class="swal2-input" placeholder="Email">
    </div>
    <span class="captcha-title"> Verify you are not a robot </span>
    <div class='main__captcha'>
      <p class="captcha-code" id='key'></p>
      <input class='captcha-input' type='text' id='signInCaptcha' placeholder='Captcha' />
      <button class="verify-button" id='btn' onclick='printmsg()'>Verify</button>
      <div class='inline' onclick='generate()'><i id="refresh-icon" class='fas fa-sync'></i></div>
    </div>
    <p class="error-captcha" id="error-message"></p>
    <button class="login-button" onclick="openLoginModal()">log in</button>
  `,
  showCancelButton: false,
  confirmButtonText: "sign in",
  allowOutsideClick: false,
  preConfirm: async () => {
    const userInput = document.getElementById("signInCaptcha").value;
    const captchaKey = document.getElementById("key").textContent;
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;
    const email = document.getElementById("emailInput").value;

    if (!username) {
      Swal.showValidationMessage("Please enter your username");
      return false;
    }
    if (!password) {
      Swal.showValidationMessage("Please enter your password");
      return false;
    }
    if (!email) {
      Swal.showValidationMessage("Please enter your email");
      return false;
    }
    if (!isValidEmail(email)) {
      Swal.showValidationMessage("Please enter a valid email address");
      return false;
    }
    if (userInput !== captchaKey) {
      document.getElementById("error-message").textContent = "Insert Captcha, please!";
      return false;
    }

    return {
      username: username,
      password: password,
      email: email,
    };
  },
}).then((result) => {
  if (result.isConfirmed) {
    const user = result.value;

    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password,
        email: user.email,
      }),
    }).then(response => {
      if (!response.ok) {
        return Swal.fire("Registration Error", "There was a problem with the registration.", "error");
      }
    });

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
      errorMessageDiv.style.display = "block"; // show the element

      const videoGridDiv = document.getElementById("video-grid");
      videoGridDiv.style.display = "none"; // Hide the div "video-grid"
    });

    window.addEventListener("online", function () {
      const errorMessageDiv = document.getElementById("error-container");
      errorMessageDiv.style.display = "none"; // hide the element

      const videoGridDiv = document.getElementById("video-grid");
      videoGridDiv.style.display = "block"; // Show the div "video-grid" again

      const refreshButton = document.getElementById("refreshButton");
      if (refreshButton) {
        refreshButton.remove(); // Remove the button if it is present
      }
    });
  }
});

function generate() {
  const captchaLength = 6; // Captcha length
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";

  for (let i = 0; i < captchaLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    captcha += characters[randomIndex];
  }

  // Show captcha in the element with ID "key"
  document.getElementById("key").textContent = captcha;
}

generate();

// Verify captcha
function printmsg() {
  const userInput = document.getElementById("sign in").value;
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
