function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}
async function handleCredentialResponse(response) {
  let data = parseJwt(response.credential);
  console.log(data);
  const { email, name } = data;
  const picture = data.picture;

  try {
    const r = await axios.post(
      "https://employee-system313.herokuapp.com/auth",
      {
        email,
        name,
        picture,
      }
    );
    console.log(r.data);
    const { token } = r.data;
    Cookies.set("token", token);
    Cookies.set("role", "employee");
    window.location.reload();
  } catch (e) {
    console.log(e);
  }
}
async function auth_intialize() {
  const auth = Cookies.get("token");
  if (auth === undefined) {
    window.google.accounts.id.initialize({
      client_id:
        "702606862459-ipt9tcu0jj8sj3hqnre66oh2rvd2kiop.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    document.querySelector(
      ".auth_button"
    ).innerHTML = `  <div id="buttonDiv"></div> `;

    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" } // customization attributes
    );

    window.google.accounts.id.prompt();
  } else {
    // get data from JWT by decoding it

    try {
      const r = await axios.get(
        "https://employee-system313.herokuapp.com/auth/user",
        {
          headers: {
            Authorization: `${auth}`,
          },
        }
      );
      console.log(r);

      document.querySelector(
        ".auth_button"
      ).innerHTML = `<button class="btn btn-secondary" onClick="logout()">Logout</button>`;
      document.querySelector(
        ".auth__list"
      ).innerHTML = `<li class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle"
        href="https://shadyaltamash.github.io/Employee-System/profile/u"
        id="navbarDropdown"
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Account
      </a>
      <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
        <li><a class="dropdown-item" href="/profile/u">My Profile</a></li>
      </ul>
    </li>`;
      document.querySelector(".authenticated").classList.remove("d-none");
      document.querySelector(".unauthenticate").classList.add("d-none");
    } catch (e) {
      console.log(e);
    }
  }
}

function logout() {
  Cookies.remove("token");
  window.location.reload();
}

const book_slot_btn = document.querySelector(".book_btn");
console.log("Hello World");
console.log(book_slot_btn);
book_slot_btn.addEventListener("click", (e) => {
  console.log("Clicked");
  const date = document.querySelector("#slot").value;
  bookSlot(date);
});

// functionality for booking a work slot

async function bookSlot(DATE) {
  //check is user enter previous data

  if (!DATE) {
    alert("Please choose a date");
    return;
  }
  const D = new Date(DATE);
  const date = D.getDate();
  const day = D.getDay();
  const weekOfMonth = Math.ceil((date - 1 - day) / 7);

  // first check if the current weekday is of sunday

  const today = new Date(DATE);
  const d = today.getDay();

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  if (d === 0) {
    alert("Sorry, we are not accepting bookings on Sundays");
    return;
  }

  if (new Date(DATE) < new Date()) {
    alert("You can't book a slot in the past");
    return;
  }

  if (localStorage.getItem("booked") === DATE) {
    alert(
      "You have already booked a slot On this day please choose another day"
    );
    return;
  }

  // first check is the current employee worked on three days in current week

  try {
    const r = await axios.get(
      `https://employee-system313.herokuapp.com/slots/${weekOfMonth}`,
      {
        headers: {
          Authorization: `${Cookies.get("token")}`,
        },
      }
    );
    console.log(r.data.length);
    let total_working_day = r.data.length;
    if (total_working_day < 3) {
      try {
        console.log(weekOfMonth);
        const r = await axios.post(
          `https://employee-system313.herokuapp.com/book`,
          { weekOfMonth, day: days[day] },
          {
            headers: {
              Authorization: `${Cookies.get("token")}`,
            },
          }
        );
        console.log(r.data);
        const { message } = r.data;
        alert(message);
        localStorage.setItem("booked", DATE);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("You have already booked 3 slots in this week");
    }
  } catch (e) {
    console.log(e);
  }
}

async function getSlots(weekDay) {
  try {
    const r = await axios.get(
      `https://employee-system313.herokuapp.com/admin/slots/${weekDay}`
    );
    return r.data;
  } catch (e) {
    if (e.response && e.response.data) {
      return e.response.data;
    }
  }
}

function checkRole() {
  const role = Cookies.get("role");
  if (role == "employee") {
    document.querySelector(".schedule__container").classList.remove("d-none");
    document.querySelector(".schedule__container").classList.add("d-flex");
  }
}

// get all slots

window.onload = () => {
  auth_intialize();
  checkRole();
  const D = new Date();
  const date = D.getDate();
  const day = D.getDay();
  const weekOfMonth = Math.ceil((date - 1 - day) / 7);
  const slots_table_body = document.querySelector(".slot-table-body");

  getSlots(weekOfMonth)
    .then((slots) => {
      console.log(slots);
      slots
        .filter((sl) => sl.length > 0)
        .forEach((sl, i) => {
          console.log(i);

          slots_table_body.innerHTML += `<tr>
       <td>${sl[0]}</td>
       <td>${sl[1]}</td>
       <td>${sl[2]}</td>
       <td>${sl[3]}</td>
       <td>${sl[4]}</td>
       <td>${sl[5]}</td>
       <td><button class="btn btn-danger delete-btn ${
         Cookies.get("role") !== "admin" && "d-none"
       }" id="${i + 2}">Delete</button></td>
      </tr>`;
        });
      const buttons = [...document.querySelectorAll(".delete-btn")];
      console.log(buttons);
      buttons.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.id;
          console.log(id);
          try {
            const r = await axios.delete(
              "https://employee-system313.herokuapp.com/admin/slot/delete/" +
                id +
                "/" +
                weekOfMonth,
              {
                headers: {
                  Authorization: `${Cookies.get("token")}`,
                },
              }
            );
            console.log(r);
            if (r.status == 200) {
              alert("Slot deleted successfully");
              window.location.reload();
            }
          } catch (e) {
            console.log(e);
          }
        });
      });
    })
    .catch((e) => {
      console.log(e);
    });
  // add delete functionality on buttons
};

document.querySelector("#week").addEventListener("change", (e) => {
  let week = e.target.value;

  console.log(week);
  const slots_table_body = document.querySelector(".slot-table-body");
  const D = new Date();
  const date = D.getDate();
  const day = D.getDay();
  const weekOfMonth = Math.ceil((date - 1 - day) / 7);
  week = week === "this week" ? weekOfMonth : week;
  localStorage.setItem("week", week);
  slots_table_body.innerHTML = "";
  getSlots(week)
    .then((slots) => {
      console.log(slots);
      slots
        .filter((sl) => sl.length > 0)
        .forEach((sl, i) => {
          console.log(i);

          slots_table_body.innerHTML += `<tr>
       <td>${sl[0]}</td>
       <td>${sl[1]}</td>
       <td>${sl[2]}</td>
       <td>${sl[3]}</td>
       <td>${sl[4]}</td>
       <td>${sl[5]}</td>
       <td><button class="btn btn-danger delete-btn ${
         Cookies.get("role") !== "admin" && "d-none"
       }" id="${i + 2}">Delete</button></td>
      </tr>`;
        });
      const buttons = [...document.querySelectorAll(".delete-btn")];

      buttons.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.id;
          console.log(id);
          try {
            const r = await axios.delete(
              "https://employee-system313.herokuapp.com/admin/slot/delete/" +
                id +
                "/" +
                localStorage.getItem("week"),
              {
                headers: {
                  Authorization: `${Cookies.get("token")}`,
                },
              }
            );
            console.log(r);
            if (r.status == 200) {
              alert("Slot deleted successfully");
              window.location.reload();
            }
          } catch (e) {
            console.log(e);
          }
        });
      });
    })
    .catch((e) => {
      console.log(e);
    });
});
