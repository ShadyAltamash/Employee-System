async function fetchUserInfo() {
  console.log("Run");
  try {
    const r = await axios.get(
      `https://employee-system313.herokuapp.com/auth/user`,
      {
        headers: {
          Authorization: `${Cookies.get("token")}`,
        },
      }
    );
    return r.data;
  } catch (e) {
    if (e.response && e.response.data) {
      console.log(e.response.data);
      return false;
    }
  }
}

async function fetchAdminInfo() {
  console.log("Run");
  try {
    const r = await axios.get(`https://employee-system313.herokuapp.com/admin/me`, {
      headers: {
        Authorization: `${Cookies.get("token")}`,
      },
    });
    return r.data;
  } catch (e) {
    if (e.response && e.response.data) {
      console.log(e.response.data);
      return false;
    }
  }
}

async function Init() {
  if (Cookies.get("role") === "admin") {
    const data = await fetchAdminInfo();
    console.log(data);
    const { name, email } = data;
    document.querySelector(".name").textContent = name;
    document.querySelector(".email").textContent = email;
    document.querySelector(".user__avatar").style.display = "none";
  } else {
    const data = await fetchUserInfo();
    console.log(data);
    const { name, email, avatar } = data;
    document.querySelector(".name").textContent = name;
    document.querySelector(".email").textContent = email;
    document.querySelector(
      ".user__avatar"
    ).style.backgroundImage = `url(${avatar})`;
  }
}

Init();
