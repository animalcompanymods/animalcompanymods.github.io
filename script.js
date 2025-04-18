let allItems = [];
let inventory = {
  items: []
};
let advancedMode = false;
let selectedContainerId = 'root';

document.addEventListener('DOMContentLoaded', () => {
  fetch('files.json')
    .then(res => res.json())
    .then(data => {
      allItems = data;
      updateItemSelect();
    })
    .catch(err => console.error("Failed to load items:", err));
  
  document.getElementById("addItem").addEventListener("click", addItemToInventory);
  document.getElementById("downloadJson").addEventListener("click", downloadJson);
  document.getElementById("advancedMode").addEventListener("click", toggleAdvancedMode);
  document.getElementById("searchInput").addEventListener("input", handleSearch);
  
  document.getElementById("containerSelect").addEventListener("change", (e) => {
    selectedContainerId = e.target.value;
  });
  document.getElementById("galaxyMode").addEventListener("change", handleGalaxyToggle);
  document.getElementById("filterMode").addEventListener("change", updateItemSelect);

  document.getElementById("importJson").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            if (jsonData && jsonData.objects && jsonData.objects[0] && jsonData.objects[0].value) {
              const inventoryData = JSON.parse(jsonData.objects[0].value);
              if (inventoryData && inventoryData.items) {
                inventory.items = inventoryData.items;
                updateInventoryTree();
                alert("JSON imported successfully!");
              } else {
                alert("Invalid JSON structure: Missing 'items' key.");
              }
            } else {
              alert("Invalid JSON structure.");
            }
          } catch (error) {
            alert("Error parsing JSON file.");
          }
        };
        reader.readAsText(file);
      }
    });

    input.click();
  });

  const itemSelect = document.getElementById("itemSelect");
  const filterModeContainer = document.getElementById("filterModeContainer");

  const toggleFilterModeVisibility = () => {
    if (itemSelect.value === "random") {
      filterModeContainer.style.display = "block";
    } else {
      filterModeContainer.style.display = "none";
    }
  };

  toggleFilterModeVisibility();

  itemSelect.addEventListener("change", toggleFilterModeVisibility);

  function handleGalaxyToggle() {
    const galaxyEnabled = document.getElementById("galaxyMode").checked;
    const hueSlider = document.getElementById("hue");
    const hueDisplay = document.getElementById("hueValue");
    const saturationSlider = document.getElementById("saturation");
    const saturationDisplay = document.getElementById("saturationValue");
    
    hueSlider.disabled = galaxyEnabled;
    saturationSlider.disabled = galaxyEnabled;
    document.getElementById("randomHue").disabled = galaxyEnabled;
    document.getElementById("randomSaturation").disabled = galaxyEnabled;
    document.getElementById("sameRandomHue").disabled = galaxyEnabled;
    document.getElementById("sameRandomSaturation").disabled = galaxyEnabled;

    if (galaxyEnabled) {
      hueSlider.value = 161;
      hueDisplay.value = "161";
      saturationSlider.value = 120;
      saturationDisplay.value = "120";
    }
  }

  
  setupRandomOptionVisibility("randomHue", "randomHueToggleWrap");
  setupRandomOptionVisibility("randomSaturation", "randomSaturationToggleWrap");
  setupRandomOptionVisibility("randomSize", "randomSizeToggleWrap");

  updateItemSelect();
});

function setupRandomOptionVisibility(checkboxId, toggleWrapperId) {
  const checkbox = document.getElementById(checkboxId);
  const toggleWrap = document.getElementById(toggleWrapperId);
  
  toggleWrap.style.display = checkbox.checked ? "block" : "none";
  
  checkbox.addEventListener("change", function() {
    toggleWrap.style.display = this.checked ? "block" : "none";
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleAdvancedMode() {
  advancedMode = !advancedMode;
  const advancedModeBtn = document.getElementById("advancedMode");
  
  if (advancedMode) {
    advancedModeBtn.textContent = "Advanced Mode";
    advancedModeBtn.classList.add("advanced");
  } else {
    advancedModeBtn.textContent = "Basic Mode";
    advancedModeBtn.classList.remove("advanced");
  }
  
  document.querySelectorAll('.item-id').forEach(el => {
    if (advancedMode) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
}

const setupSlider = (sliderId, valueId) => {
  const slider = document.getElementById(sliderId);
  const valueInput = document.getElementById(valueId);

  valueInput.value = slider.value;

  slider.addEventListener('input', function () {
    valueInput.value = this.value;
  });

  valueInput.addEventListener('input', function () {
    const value = Math.min(Math.max(this.value, slider.min), slider.max);
    slider.value = value;
    this.value = value; 
  });
};

setupSlider('hue', 'hueValue');
setupSlider('saturation', 'saturationValue');
setupSlider('size', 'sizeValue');

function handleSearch() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const suggestionsContainer = document.getElementById("searchSuggestions");
  
  if (searchText.length > 0) {
    const matchingItems = allItems
      .filter(item => 
        item.name.toLowerCase().includes(searchText) || 
        item.id.toLowerCase().includes(searchText))
      .slice(0, 5);
      
    suggestionsContainer.innerHTML = '';
    
    if (matchingItems.length > 0) {
      suggestionsContainer.classList.add('active');
      
      matchingItems.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.innerHTML = `
          <div class="item-name">${item.name}</div>
          <div class="item-id ${advancedMode ? 'visible' : ''}">${item.id}</div>
        `;
        
        suggestionItem.addEventListener('click', () => {
          document.getElementById('itemSelect').value = item.id;
          suggestionsContainer.classList.remove('active');
          document.getElementById('searchInput').value = '';
        });
        
        suggestionsContainer.appendChild(suggestionItem);
      });
    } else {
      suggestionsContainer.classList.remove('active');
    }
  } else {
    suggestionsContainer.classList.remove('active');
  }
  
  filterInventoryTree(searchText);
}

function filterInventoryTree(searchText) {
  const treeItems = document.querySelectorAll('#inventoryTree li');
  
  treeItems.forEach(item => {
    const itemName = item.getAttribute('data-name').toLowerCase();
    const itemId = item.getAttribute('data-item-id').toLowerCase();
    
    if (!searchText || itemName.includes(searchText) || itemId.includes(searchText)) {
      item.classList.remove('hidden');
      
      let parent = item.parentElement;
      while (parent && parent.classList.contains('child-items')) {
        parent.classList.add('expanded');
        parent = parent.parentElement.parentElement;
      }
    } else {
      const hasVisibleChildren = Array.from(item.querySelectorAll('li'))
        .some(child => !child.classList.contains('hidden'));
      
      if (!hasVisibleChildren) {
        item.classList.add('hidden');
      } else {
        item.classList.remove('hidden');
      }
    }
  });
}

function addItemToInventory() {
  const itemID = document.getElementById("itemSelect").value;
  const count = parseInt(document.getElementById("count").value, 10) || 1;
  const containerID = selectedContainerId;

  const galaxyMode = document.getElementById("galaxyMode").checked;

  const randomHue = document.getElementById("randomHue").checked;
  const randomSaturation = document.getElementById("randomSaturation").checked;
  const randomSize = document.getElementById("randomSize").checked;

  const sameRandomHue = document.getElementById("sameRandomHue").checked;
  const sameRandomSaturation = document.getElementById("sameRandomSaturation").checked;
  const sameRandomSize = document.getElementById("sameRandomSize").checked;

  const hueVal = galaxyMode ? 161 : parseInt(document.getElementById("hue").value) || 0;
  const satVal = galaxyMode ? 120 : parseInt(document.getElementById("saturation").value) || 0;
  const sizeVal = parseInt(document.getElementById("size").value) || 0;

  const sharedRandomHue = (galaxyMode || !randomHue) ? hueVal : getRandomInt(0, 255);
  const sharedRandomSaturation = (galaxyMode || !randomSaturation) ? satVal : getRandomInt(0, 100);
  const sharedRandomSize = randomSize ? getRandomInt(-100, 100) : sizeVal;

  for (let i = 0; i < count; i++) {
    let selectedItemID = itemID;

    if (itemID === "random") {
      const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
      selectedItemID = randomItem.id;
    } else if (itemID === "randomContainer") {
      const containers = allItems.filter(item => isContainer(item, item.id));
      const randomContainer = containers[Math.floor(Math.random() * containers.length)];
      selectedItemID = randomContainer ? randomContainer.id : null;
    } else if (itemID === "randomItem") {
      const items = allItems.filter(item => !isContainer(item, item.id));
      const randomItem = items[Math.floor(Math.random() * items.length)];
      selectedItemID = randomItem ? randomItem.id : null;
    }

    if (!selectedItemID) {
      alert("No valid item found for the selected option.");
      continue;
    }

    const newItem = {
      itemID: selectedItemID,
      colorHue: galaxyMode
        ? 161
        : (randomHue ? (sameRandomHue ? sharedRandomHue : getRandomInt(0, 255)) : hueVal),
      colorSaturation: galaxyMode
        ? 120
        : (randomSaturation ? (sameRandomSaturation ? sharedRandomSaturation : getRandomInt(0, 100)) : satVal),
      scaleModifier: randomSize
        ? (sameRandomSize ? sharedRandomSize : getRandomInt(-100, 100))
        : sizeVal,
      count: 1
    };

    if (containerID === 'root') {
      const existingItem = findExistingItem(inventory.items, newItem);
      if (existingItem) {
        existingItem.count = (existingItem.count || 1) + 1;
      } else {
        inventory.items.push(newItem);
      }
    } else {
      addToContainer(inventory.items, containerID, newItem);
    }
  }

  updateInventoryTree();
}

function findExistingItem(items, newItem) {
  return items.find(item => 
    item.itemID === newItem.itemID &&
    item.colorHue === newItem.colorHue &&
    item.colorSaturation === newItem.colorSaturation &&
    item.scaleModifier === newItem.scaleModifier
  );
}

function addToContainer(items, containerID, newItem) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].itemID === containerID) {
      if (!items[i].children) {
        items[i].children = [];
      }
      
      const existingItem = findExistingItem(items[i].children, newItem);
      if (existingItem) {
        existingItem.count = (existingItem.count || 1) + 1;
      } else {
        items[i].children.push(newItem);
      }
      return true;
    }
    
    if (items[i].children && items[i].children.length > 0) {
      if (addToContainer(items[i].children, containerID, newItem)) {
        return true;
      }
    }
  }
  return false;
}

function isContainer(itemData, itemID) {
  if (!itemData) return false;
  
  return (
    itemData.category === "Bags" || 
    itemID.toLowerCase().includes("backpack") ||
    itemID.toLowerCase().includes("crossbow") ||
    itemData.name.toLowerCase().includes("crossbow")
  );
}

function updateInventoryTree() {
  const inventoryTree = document.getElementById("inventoryTree");
  inventoryTree.innerHTML = '';
  
  updateContainerSelect();
  
  inventory.items.forEach(item => {
    renderInventoryItem(item, inventoryTree);
  });
}

function updateContainerSelect() {
  const containerSelect = document.getElementById("containerSelect");
  containerSelect.innerHTML = '<option value="root">Root (No Container)</option>';
  
  const addContainers = (items, path = "") => {
    items.forEach(item => {
      const itemData = allItems.find(i => i.id === item.itemID);
      
      if (isContainer(itemData, item.itemID)) {
        const name = itemData ? itemData.name : item.itemID;
        const pathDisplay = path ? `${path} > ${name}` : name;
        
        const option = document.createElement("option");
        option.value = item.itemID;
        option.textContent = pathDisplay;
        containerSelect.appendChild(option);
      }
      
      if (item.children && item.children.length > 0) {
        const itemName = itemData ? itemData.name : item.itemID;
        const newPath = path ? `${path} > ${itemName}` : itemName;
        addContainers(item.children, newPath);
      }
    });
  };
  
  addContainers(inventory.items);
  
  if (selectedContainerId) {
    const exists = Array.from(containerSelect.options).some(option => option.value === selectedContainerId);
    if (exists) {
      containerSelect.value = selectedContainerId;
    } else {
      selectedContainerId = 'root';
      containerSelect.value = 'root';
    }
  }
}

function renderInventoryItem(item, parentElement, level = 0) {
  const itemData = allItems.find(i => i.id === item.itemID);
  const itemName = itemData ? itemData.name : item.itemID;
  
  const li = document.createElement("li");
  li.dataset.itemId = item.itemID;
  li.dataset.name = itemName;
  
  const isContainerItem = isContainer(itemData, item.itemID);
  const hasChildren = item.children && item.children.length > 0;
  
  const treeItem = document.createElement("div");
  treeItem.className = `tree-item ${isContainerItem ? 'container' : ''}`;
  
  const treeItemInfo = document.createElement("div");
  treeItemInfo.className = "tree-item-info";
  
  if (isContainerItem || hasChildren) {
    const toggle = document.createElement("span");
    toggle.className = "tree-toggle";
    toggle.textContent = "►";
    toggle.addEventListener("click", () => {
      const childContainer = li.querySelector('.child-items');
      if (childContainer.classList.contains('expanded')) {
        childContainer.classList.remove('expanded');
        toggle.textContent = "►";
      } else {
        childContainer.classList.add('expanded');
        toggle.textContent = "▼";
      }
    });
    treeItemInfo.appendChild(toggle);
  }
  
  const itemContent = document.createElement("div");
  itemContent.className = "tree-item-content";
  
  const countDisplay = item.count && item.count > 1 ? ` (x${item.count})` : '';
  
  itemContent.innerHTML = `
    <span>${itemName}${countDisplay}</span>
    <span class="item-id ${advancedMode ? 'visible' : ''}">(${item.itemID})</span>
    ${hasChildren ? `<span class="item-count">${item.children.length} items</span>` : ''}
  `;
  
  if (item.colorHue !== undefined || item.colorSaturation !== undefined || item.scaleModifier !== undefined) {
    const propsTable = document.createElement("table");
    propsTable.className = "properties-table";
    propsTable.innerHTML = `
      <tr>
        <td>Hue:</td>
        <td>${item.colorHue !== undefined ? item.colorHue : 'default'}</td>
        <td>Saturation:</td>
        <td>${item.colorSaturation !== undefined ? item.colorSaturation : 'default'}</td>
        <td>Size:</td>
        <td>${item.scaleModifier !== undefined ? item.scaleModifier : 'default'}</td>
      </tr>
    `;
    itemContent.appendChild(propsTable);
  }
  
  treeItemInfo.appendChild(itemContent);
  treeItem.appendChild(treeItemInfo);
  
  const actionDiv = document.createElement("div");
  actionDiv.className = "item-actions";
  
  if (level > 0) {
    const moveUpBtn = document.createElement("button");
    moveUpBtn.textContent = "Move Up";
    moveUpBtn.addEventListener("click", () => {
      moveItemUp(item, level);
    });
    actionDiv.appendChild(moveUpBtn);
  }
  
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    deleteItem(item, level);
  });
  actionDiv.appendChild(deleteBtn);
  
  treeItem.appendChild(actionDiv);
  li.appendChild(treeItem);
  
  if (isContainerItem || hasChildren) {
    const childContainer = document.createElement("ul");
    childContainer.className = "child-items";
    li.appendChild(childContainer);
    
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        renderInventoryItem(child, childContainer, level + 1);
      });
    }
  }
  
  parentElement.appendChild(li);
}

function moveItemUp(item, level) {
  const findItemAndParent = (items, targetItem, parentArray = null) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i] === targetItem) {
        return { item: items[i], parent: items, index: i, parentArray };
      }
      
      if (items[i].children && items[i].children.length > 0) {
        const result = findItemAndParent(items[i].children, targetItem, items[i]);
        if (result) return result;
      }
    }
    return null;
  };
  
  const itemInfo = findItemAndParent(inventory.items, item);
  
  if (itemInfo && itemInfo.parentArray) {
    itemInfo.parent.splice(itemInfo.index, 1);
    
    const findParentArray = (items, targetArray) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].children === targetArray) {
          return { parent: items, index: i };
        }
        
        if (items[i].children && items[i].children.length > 0) {
          const result = findParentArray(items[i].children, targetArray);
          if (result) return result;
        }
      }
      return null;
    };
    
    const grandparentInfo = findParentArray(inventory.items, itemInfo.parent);
    
    if (grandparentInfo) {
      const existingItem = findExistingItem(grandparentInfo.parent, item);
      if (existingItem) {
        existingItem.count = (existingItem.count || 1) + (item.count || 1);
      } else {
        grandparentInfo.parent.push(item);
      }
    } else {
      const existingItem = findExistingItem(inventory.items, item);
      if (existingItem) {
        existingItem.count = (existingItem.count || 1) + (item.count || 1);
      } else {
        inventory.items.push(item);
      }
    }
    
    updateInventoryTree();
  }
}

function deleteItem(targetItem, level = 0) {
  const removeItem = (items, item) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i] === item) {
        items.splice(i, 1);
        return true;
      }
      
      if (items[i].children && items[i].children.length > 0) {
        if (removeItem(items[i].children, item)) {
          return true;
        }
      }
    }
    return false;
  };
  
  removeItem(inventory.items, targetItem);
  updateInventoryTree();
}

function downloadJson() {
  const fileTitleInput = document.getElementById("fileTitle");
  const fileTitle = fileTitleInput.value.trim() || "custom_inventory";

  const processItemsForOutput = (items) => {
    return items.map(item => {
      const processedItem = { ...item };
      const count = processedItem.count || 1;
      delete processedItem.count;

      if (processedItem.children && processedItem.children.length > 0) {
        processedItem.children = processItemsForOutput(processedItem.children);
      }

      if (count === 1) {
        return processedItem;
      } else {
        return Array(count).fill().map(() => ({ ...processedItem }));
      }
    }).flat();
  };

  const processedItems = processItemsForOutput(inventory.items);

  const outputInventory = {
    version: 1,
    items: processedItems
  };

  const jsonOutput = {
    objects: [
      {
        collection: "user_inventory",
        key: "stash",
        permission_read: 1,
        permission_write: 1,
        value: JSON.stringify(outputInventory)
      }
    ]
  };

  const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileTitle}.json`;
  link.click();
}

function updateItemSelect() {
  const itemSelect = document.getElementById("itemSelect");

  itemSelect.innerHTML = '';

  const randomOption = document.createElement("option");
  randomOption.value = "random";
  randomOption.textContent = "Random (All)";
  itemSelect.appendChild(randomOption);

  const randomContainerOption = document.createElement("option");
  randomContainerOption.value = "randomContainer";
  randomContainerOption.textContent = "Container (Random Container)";
  itemSelect.appendChild(randomContainerOption);

  const randomItemOption = document.createElement("option");
  randomItemOption.value = "randomItem";
  randomItemOption.textContent = "Item (Random Item)";
  itemSelect.appendChild(randomItemOption);

  if (!allItems || allItems.length === 0) {
    console.error("No items found in the JSON file.");
    return;
  }

  allItems.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    itemSelect.appendChild(option);
  });
}

document.getElementById("filterMode").addEventListener("change", updateItemSelect);
