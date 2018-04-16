import { renderUI, clearUI } from "applicationRoot/renderUI";
import { store, getNewReducer } from "applicationRoot/store";
import { createElement } from "react";
import queryString from "query-string";
import ajaxUtil from "util/ajaxUtil";
import "react-loadable";
import "immutability-helper";

import "./junkTS";

import compoundName from "compound-name";
import compound from "compound";

import wellSee from "./newScript";

let QQQ = wellSee;
debugger;

let importedCompoundName = compoundName;
let importedCompound = compound;

//debugger;

const html = require("./junk.htm!text");
import html3 from "./junk3.html!text";

System.import("./junk2.htm!text").then(module => {
  console.log("imported", module);
});

import cjs from "./cjsModule";

System.import("./amdModule").then(res => {
  // debugger;
});

// console.log(html);
// console.log(html2);
// console.log(html3);

//import "./junk.css!css";
//import "./junk2.css!css";
setTimeout(() => {
  System.import("./junk.css!css");
  System.import("./junk2.css!css");
}, 3000);

import "./someScript";

import { Client, setDefaultClient } from "micro-graphql-react";

console.log("SCRIPT VALUE", typeof scriptGlobalVal);

const graphqlClient = new Client({
  endpoint: "/graphql",
  fetchOptions: { credentials: "include" }
});

setDefaultClient(graphqlClient);

export type MutationType = { runMutation: any, dispatch: any, running: any };

import {
  setDesktop,
  setMobile,
  setModule,
  setLoggedIn,
  setPublicInfo,
  setRequestDesktop,
  setIsTouch
} from "./applicationRoot/rootReducerActionCreators";
import "util/ajaxUtil";

import createHistory from "history/createBrowserHistory";

(function() {
  if ("serviceWorker" in navigator && !/localhost/.test(window.location)) {
    navigator.serviceWorker.register("/service-worker.js");
    try {
      navigator.serviceWorker.controller.postMessage({ command: "sync-images" });
    } catch (er) {}

    // if (Notification) {
    //   Notification.requestPermission().then(permission => {});
    // }

    if (isLoggedIn()) {
      // let subscriptionOptions = {
      //   userVisibleOnly: true,
      //   applicationServerKey: urlBase64ToUint8Array("BCC0wqyL-OGz5duRO9-kOSUEv72BMGf0x0oaMGryF1eLa3FF-sW2YmunhNqQegrXHykP-Wa6xC1rEnDuBGtjgUo")
      // };
      // navigator.serviceWorker.ready.then(registration => {
      //   registration.pushManager.subscribe(subscriptionOptions).then(subscription => {
      //     ajaxUtil.post("/user/saveNotificationSubscription", { subscription: JSON.stringify(subscription) });
      //   });
      // });
    }
  }
})();

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function sendNotification(text) {
  if (Notification.permission == "granted") {
    new Notification(text);
  }
}

//sendNotification("Hi there");

if ("ontouchstart" in window || "onmsgesturechange" in window) {
  store.dispatch(setIsTouch(true));
}

try {
  var desktopRequested = !!localStorage.getItem("useDesktop");
} catch (x) {}

if (window.screen.width < 700) {
  store.dispatch(setMobile());
} else {
  store.dispatch(setDesktop());
}

if (desktopRequested) {
  store.dispatch(setRequestDesktop());
}

let currentModule;
let currentModuleObject;
let publicUserCache = {};

const history = createHistory();
export { history };

const validModules = new Set(["books", "scan", "home", "activate", "view", "subjects", "settings"]);
let initial = true;
const unlisten = history.listen((location, action) => {
  // location is an object like window.location
  loadModule(location);
});
loadCurrentModule();

export function loadCurrentModule() {
  loadModule(history.location);
}

function loadModule(location) {
  let originalModule = location.pathname.replace(/\//g, "").toLowerCase(),
    module = originalModule || "home",
    publicModule = module === "view" || module == "activate";

  let { logged_in, userId: currentUserId } = isLoggedIn(),
    loggedIn = logged_in && currentUserId;

  if (!loggedIn && !publicModule) {
    if (originalModule && module != "home") {
      module = "authenticate";
    } else {
      module = "home";
    }
  } else {
    if (!validModules.has(module)) {
      history.push("/books");
      return;
    }
  }

  if (loggedIn) {
    store.dispatch(setLoggedIn(currentUserId));
  }

  if (publicModule) {
    var userId = getCurrentHistoryState().searchState.userId;

    //switching to a new public viewing - reload page
    if (!initial && store.getState().app.publicUserId != userId) {
      window.location.reload();
      return;
    }

    var publicUserPromise = userId ? publicUserCache[userId] || (publicUserCache[userId] = fetchPublicUserInfo(userId)) : null;

    if (module === "view") {
      module = "books";
    }
  } else if (store.getState().app.publicUserId) {
    //leaving public viewing - reload page
    window.location.reload();
    return;
  }

  initial = false;

  if (module === currentModule) {
    return;
  }
  currentModule = module;

  let modulePromise = (() => {
    switch (module.toLowerCase()) {
      case "activate":
        return System.import(/* webpackChunkName: "small-modules" */ "./modules/activate/activate");
      case "authenticate":
        return System.import(/* webpackChunkName: "small-modules" */ "./modules/authenticate/authenticate");
      case "books":
        return System.import(/* webpackChunkName: "books-module" */ "./modules/books/books");
      case "home":
        return System.import(/* webpackChunkName: "home-module" */ "./modules/home/home");
      case "scan":
        return System.import(/* webpackChunkName: "scan-module" */ "./modules/scan/scan");
      case "subjects":
        return System.import(/* webpackChunkName: "subject-module" */ "./modules/subjects/subjects");
      case "settings":
        return System.import(/* webpackChunkName: "small-modules" */ "./modules/settings/settings");
    }
  })();

  Promise.all([modulePromise, publicUserPromise]).then(([{ default: moduleObject }, publicUserInfo]) => {
    if (currentModule != module) return;

    let priorState = store.getState();
    currentModuleObject = moduleObject;
    store.dispatch(setModule(currentModule));

    if (publicUserInfo) {
      store.dispatch(setPublicInfo({ ...publicUserInfo, userId }));
    }

    if (moduleObject.reducer) {
      getNewReducer({ name: module, reducer: moduleObject.reducer, initialize: moduleObject.initialize, priorState });
    }
    renderUI(createElement(moduleObject.component));
  });
}

export function isLoggedIn() {
  let logged_in = getCookie("logged_in"),
    userId = getCookie("userId");
  return { logged_in, userId };
}

function getCookie(name) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

export function goto(module, search?) {
  if (currentModule !== module) {
    history.push({ pathname: `/${module}`, search: search || undefined });
  }
}

export function getCurrentHistoryState() {
  let location = history.location;
  return {
    pathname: location.pathname,
    searchState: queryString.parse(location.search)
  };
}

export function setSearchValues(state) {
  let { pathname, searchState: existingSearchState } = getCurrentHistoryState();
  let newState = { ...existingSearchState, ...state };
  newState = Object.keys(newState)
    .filter(k => newState[k])
    .reduce((hash, prop) => ((hash[prop] = newState[prop]), hash), {});

  history.push({
    pathname: history.location.pathname,
    search: queryString.stringify(newState)
  });
}

function fetchPublicUserInfo(userId) {
  return new Promise((res, rej) => {
    ajaxUtil.post("/user/getPubliclyAvailableUsersName", { _id: userId }, resp => {
      res({ ...resp });
    });
  });
}
