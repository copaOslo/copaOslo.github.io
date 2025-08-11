document.addEventListener("DOMContentLoaded", () => {
  // Loader animation
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.display = "none";
  }, 1500); // hide after 1.5 seconds

  // Instagram fetch (embed workaround)
  fetch("https://www.instagram.com/copabartenders_oslo/?__a=1&__d=dis")
    .then(response => response.json())
    .then(data => {
      const container = document.querySelector(".insta-grid");
      const posts = data.graphql.user.edge_owner_to_timeline_media.edges;
      posts.slice(0, 6).forEach(post => {
        const img = document.createElement("img");
        img.src = post.node.thumbnail_src;
        img.alt = "Instagram post";
        container.appendChild(img);
      });
    })
    .catch(err => {
      console.error("Error loading Instagram posts", err);
      document.querySelector(".insta-grid").innerHTML =
        "<p>Unable to load Instagram posts right now.</p>";
    });
});
