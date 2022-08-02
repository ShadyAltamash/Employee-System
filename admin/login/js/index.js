// make a login request to server
const adminForm = document.getElementById("admin-form");

async function Login(email, password) {
  console.log(email, password);
  try {
    const r = await axios.post(`https://employee-system313.herokuapp.com/admin/login`, {
      email,
      password,
    });
    console.log(r.data);
    return r.data;
  } catch (e) {
    console.log(e);
    return false;
  }
}

adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  let token = await Login(email, password);
  if (token) {
    Cookies.set("token", token);
    Cookies.set("role", "admin");
    //window.location.href = "/Employee-System/";
    window.location.href = "https://shadyaltamash.github.io/Employee-System";
  }
});
