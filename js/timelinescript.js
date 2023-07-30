window.addEventListener("scroll", function() {
    let timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach(function(item) {
      let rect = item.getBoundingClientRect();
      if(rect.top < window.innerHeight && rect.bottom >= 0) {
        item.querySelector(".timeline-content").style.opacity = "1";
      } else {
        item.querySelector(".timeline-content").style.opacity = "0";
      }
    });
  });