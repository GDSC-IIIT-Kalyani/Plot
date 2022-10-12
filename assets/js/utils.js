/*
Author: chankruze (chankruze@gmail.com)
Created: Sun Oct 09 2022 22:49:55 GMT+0530 (India Standard Time)

Copyright (c) geekofia 2022 and beyond
*/

const downloadImage = (data, filename = "untitled.jpeg") => {
  var a = document.createElement("a");
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
};
