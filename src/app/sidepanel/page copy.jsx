      chrome.runtime.sendMessage({
        type: "GROUP_UPDATE",
        payload: { id: currentFolder, data: current },
      });