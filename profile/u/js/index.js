async function fetchUserInfo() {
  console.log("Run");
  try {
    const r = await axios.get(`http://localhost:3000/auth/user`, {
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

fetchUserInfo()
  .then((d) => {
    console.log(d);
    const { email, name, avatar } = d;
    document.querySelector(
      ".user__avatar"
    ).innerHTML = `<img src="${`https://avatars.dicebear.com/api/open-peeps/${name}.svg`}" alt="${name}" class="user__avatar">`;
    document.querySelector(".employee_name").innerHTML = `${name}`;
    document.querySelector(".employee_email").innerHTML = `${email}`;
  })
  .catch((e) => {
    console.log(e);
  });
