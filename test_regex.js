import fs from 'fs';

const videoUrls = [
  "https://www.youtube.com/embed/rT7DgCr-3pg",
  "https://www.youtube.com/watch?v=1234",
  "https://youtu.be/1234",
  "https://www.youtube.com/embed/WvLMauqrnK8"
];

for (const url of videoUrls) {
  let videoId = "";
  const embedMatch = url.match(/embed\/([^?]+)/);
  const watchMatch = url.match(/watch\?v=([^&]+)/);
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (embedMatch) videoId = embedMatch[1];
  else if (watchMatch) videoId = watchMatch[1];
  else if (shortMatch) videoId = shortMatch[1];
  
  console.log(url, "=>", videoId);
}
