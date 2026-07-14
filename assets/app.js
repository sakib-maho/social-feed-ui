const STORAGE_KEY = "social-feed-ui.v2";

const state = {
  posts: [],
  filtered: [],
  activeTag: "all",
  query: "",
};

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatTime(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function normalizePosts(raw) {
  return raw.map((post, index) => ({
    id: post.id || `p${index}`,
    author: post.author,
    content: post.content,
    tags: Array.isArray(post.tags) ? post.tags.map((t) => String(t).toLowerCase()) : [],
    createdAt: post.createdAt || new Date().toISOString(),
    likes: Number(post.likes || 0),
    liked: Boolean(post.liked),
    comments: Array.isArray(post.comments)
      ? post.comments.map((c) =>
          typeof c === "string" ? { id: uid("c"), text: c, at: new Date().toISOString() } : c
        )
      : [],
  }));
}

function loadPersisted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ posts: state.posts }));
}

async function loadSeed() {
  const response = await fetch("data/posts.json");
  if (!response.ok) throw new Error("Unable to load posts.");
  return normalizePosts(await response.json());
}

function allTags() {
  const set = new Set();
  state.posts.forEach((post) => post.tags.forEach((tag) => set.add(tag)));
  return [...set].sort();
}

function applyFilters() {
  const q = state.query.trim().toLowerCase();
  state.filtered = state.posts.filter((post) => {
    const tagOk = state.activeTag === "all" || post.tags.includes(state.activeTag);
    const hay = `${post.author} ${post.content} ${post.tags.join(" ")}`.toLowerCase();
    const queryOk = !q || hay.includes(q);
    return tagOk && queryOk;
  });
  renderTagChips();
  renderFeed();
}

function renderTagChips() {
  const row = document.getElementById("tagChips");
  row.innerHTML = "";
  allTags().forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `chip${state.activeTag === tag ? " active" : ""}`;
    btn.textContent = `#${tag}`;
    btn.addEventListener("click", () => {
      state.activeTag = tag;
      document.querySelectorAll(".filters .chip").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
    row.appendChild(btn);
  });
}

function renderFeed() {
  const feed = document.getElementById("feed");
  const template = document.getElementById("postTemplate");
  feed.innerHTML = "";

  if (!state.filtered.length) {
    feed.innerHTML = `<p class="muted">No posts match your filters.</p>`;
    return;
  }

  state.filtered.forEach((post) => {
    const fragment = template.content.cloneNode(true);
    const article = fragment.querySelector(".post");
    fragment.querySelector(".author").textContent = post.author;
    fragment.querySelector(".when").textContent = formatTime(post.createdAt);
    fragment.querySelector(".content").textContent = post.content;
    fragment.querySelector(".like-count").textContent = String(post.likes);
    fragment.querySelector(".comment-count").textContent = String(post.comments.length);

    const tags = fragment.querySelector(".tags");
    post.tags.forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = `#${tag}`;
      tags.appendChild(span);
    });

    const likeBtn = fragment.querySelector(".like-btn");
    if (post.liked) likeBtn.style.background = "#dbeafe";
    likeBtn.addEventListener("click", () => {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      persist();
      applyFilters();
    });

    const comments = fragment.querySelector(".comments");
    const list = fragment.querySelector(".comment-list");
    post.comments.forEach((comment) => {
      const li = document.createElement("li");
      li.textContent = comment.text;
      list.appendChild(li);
    });

    fragment.querySelector(".toggle-comments").addEventListener("click", () => {
      comments.classList.toggle("hidden");
    });

    fragment.querySelector(".comment-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = article.querySelector(".comment-input");
      const text = input.value.trim();
      if (!text) return;
      post.comments.push({ id: uid("c"), text, at: new Date().toISOString() });
      input.value = "";
      persist();
      applyFilters();
    });

    feed.appendChild(fragment);
  });
}

async function boot() {
  const persisted = loadPersisted();
  state.posts = persisted?.posts?.length
    ? normalizePosts(persisted.posts)
    : await loadSeed();

  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    applyFilters();
  });

  document.querySelector('.chip[data-tag="all"]').addEventListener("click", (event) => {
    state.activeTag = "all";
    document.querySelectorAll(".filters .chip").forEach((el) => el.classList.remove("active"));
    event.currentTarget.classList.add("active");
    applyFilters();
  });

  document.getElementById("createForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const author = document.getElementById("authorInput").value.trim();
    const content = document.getElementById("contentInput").value.trim();
    const tags = document
      .getElementById("tagsInput")
      .value.split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    state.posts.unshift({
      id: uid("p"),
      author,
      content,
      tags,
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
      comments: [],
    });
    event.target.reset();
    persist();
    applyFilters();
  });

  applyFilters();
}

boot().catch((error) => {
  document.getElementById("feed").textContent = error.message;
});

export { normalizePosts, allTags };
