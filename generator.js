let itemsList = [];
let itemData = [];

fetch("list.txt")
  .then(res => res.json())
  .then(data => {
    itemsList = data;
    const bagSelect = document.getElementById("bagSelect");
    const itemSelect = document.getElementById("itemSelect");

    const bags = itemsList.filter(i => i.id.startsWith("item_backpack"));
    bags.forEach(bag => {
      let opt = document.createElement("option");
      opt.value = bag.id;
      opt.innerText = bag.id;
      bagSelect.appendChild(opt);
    });

    itemsList.forEach(item => {
      let opt = document.createElement("option");
      opt.value = item.id;
      opt.innerText = item.id;
      itemSelect.appendChild(opt);
    });

    document.getElementById("itemSearch").addEventListener("input", () => {
      const filter = document.getElementById("itemSearch").value.toLowerCase();
      itemSelect.innerHTML = "";
      itemsList
        .filter(i => i.id.toLowerCase().includes(filter))
        .forEach(i => {
          const opt = document.createElement("option");
          opt.value = i.id;
          opt.text = i.id;
          itemSelect.appendChild(opt);
        });
    });
  });

function addItem() {
  const itemID = document.getElementById("itemSelect").value;
  const count = parseInt(document.getElementById("count").value) || 1;
  const hue = document.getElementById("randomHue").checked ? Math.floor(Math.random() * 211) : parseInt(document.getElementById("hue").value);
  const sat = document.getElementById("randomSat").checked ? Math.floor(Math.random() * 121) : parseInt(document.getElementById("sat").value);
  const size = document.getElementById("randomSize").checked ? Math.floor(Math.random() * 256 - 128) : parseInt(document.getElementById("size").value);
  const state = parseInt(document.getElementById("state").value);

  for (let i = 0; i < count; i++) {
    let item = {
      itemID,
      colorHue: hue,
      colorSaturation: sat,
      scaleModifier: size
    };
    if (itemID === "item_shredder" && state > 0) {
      item.state = Math.min(state, 8000);
    }

    itemData.push(item);
    const entry = document.createElement("li");
    entry.innerText = `${itemID} — Hue:${hue} Sat:${sat} Size:${size}` + (item.state ? ` State:${item.state}` : "");
    document.getElementById("itemList").appendChild(entry);
  }
}

function generateJSON() {
  const bag = document.getElementById("bagSelect").value;
  const data = {
    leftHand: {
      itemID: bag,
      children: itemData
    }
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${bag}_${itemData.length}.json`;
  link.click();
}

function resetAll() {
  itemData = [];
  document.getElementById("itemList").innerHTML = "";
}
