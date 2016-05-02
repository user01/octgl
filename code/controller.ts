
/// <reference path="../typings/references.d.ts" />

const initController = () => {
  require('../less/controller.less');
  console.log('Controller online');
}

window.onload = initController;