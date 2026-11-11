import { supabase } from "./config.js";

const $ = (selector) => document.querySelector(selector);

const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

const registerForm = $("#registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = $("#formMessage");
    const submit = registerForm.querySelector('[type="submit"]');
    message.textContent = "";
    message.className = "form-message";

    const fullName = $("#fullName").value.trim();
    const email = $("#email").value.trim();
    const password = $("#password").value;

    if (password.length < 8) {
      message.textContent = "Use a password with at least 8 characters.";
      message.classList.add("error");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Creating account…";
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/pages/roadmap.html`
        }
      });
      if (error) throw error;

      if (data.session) {
        message.textContent = "Account created. Redirecting to your learning dashboard…";
        message.classList.add("success");
        window.location.href = "roadmap.html";
      } else {
        message.textContent = "Account created. Check your inbox to confirm your email, then log in.";
        message.classList.add("success");
        registerForm.reset();
      }
    } catch (error) {
      message.textContent = error.message || "Could not create your account. Please try again.";
      message.classList.add("error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Create account";
    }
  });
}

const loginForm = $("#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = $("#formMessage");
    const submit = loginForm.querySelector('[type="submit"]');
    message.textContent = "";
    message.className = "form-message";
    submit.disabled = true;
    submit.textContent = "Logging in…";

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: $("#email").value.trim(),
        password: $("#password").value
      });
      if (error) throw error;
      window.location.href = "roadmap.html";
    } catch (error) {
      message.textContent = error.message || "Login failed. Check your details and try again.";
      message.classList.add("error");
      submit.disabled = false;
      submit.textContent = "Log in";
    }
  });
}

const logoutButton = $("#logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
}

const roadmapForm = $("#roadmapForm");
if (roadmapForm) {
  const message = $("#formMessage");
  const output = $("#roadmapOutput");
  const result = $("#roadmapResult");
  const userEmail = $("#userEmail");

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    window.location.replace("login.html");
  } else {
    if (userEmail) userEmail.textContent = session.user.email;
  }

  roadmapForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    message.className = "form-message";
    output.classList.remove("visible");

    const submit = roadmapForm.querySelector('[type="submit"]');
    const { data: freshSessionData } = await supabase.auth.getSession();
    const activeSession = freshSessionData.session;

    if (!activeSession) {
      message.textContent = "Your session has expired. Please log in again.";
      message.classList.add("error");
      return;
    }

    const payload = {
      skill: $("#skill").value.trim(),
      current_level: $("#currentLevel").value,
      learning_goal: $("#learningGoal").value.trim(),
      weekly_study_hours: Number($("#weeklyHours").value),
      duration: $("#duration").value,
      user_id: activeSession.user.id,
      email: activeSession.user.email
    };

    submit.disabled = true;
    submit.textContent = "Creating your roadmap…";

    try {
      const { ROADMAP_WEBHOOK_URL } = await import("./config.js");
      if (!ROADMAP_WEBHOOK_URL || ROADMAP_WEBHOOK_URL.includes("YOUR_N8N")) {
        throw new Error("The n8n webhook URL has not been configured yet.");
      }

      const response = await fetch(ROADMAP_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeSession.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(responseData.message || "The roadmap service could not process your request.");
      }

      const roadmapText = responseData.roadmap || responseData.data?.roadmap ||
        responseData.message || JSON.stringify(responseData, null, 2);

      result.textContent = typeof roadmapText === "string"
        ? roadmapText
        : JSON.stringify(roadmapText, null, 2);
      output.classList.add("visible");
      message.textContent = responseData.email_sent
        ? "Your roadmap is ready and an email has been sent."
        : "Your roadmap is ready. Email delivery status will be confirmed separately.";
      message.classList.add("success");
    } catch (error) {
      message.textContent = error.message || "Something went wrong. Please try again.";
      message.classList.add("error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Generate my learning roadmap";
    }
  });
}
