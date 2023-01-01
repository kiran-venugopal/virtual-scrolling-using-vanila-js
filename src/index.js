import "./styles.css";
import { getItem } from "./utils/data.utils";
import { db } from "./utils/db.utils";
import VirtualList from "./virtual-list/virtual-list";

const templateFn = (item) => {
  return `<section class="feed__item">
            <img class="feed__item__img" alt="Avatar for logo" src="${item.url}"/>
            <div class="feed__item__description">
              <h2 class="h2-header">${item.name}</h2>
              <p class="p-text">${item.description}</p>
            </div>
        </section>`.trim();
};

function updateTemplate(element, data) {
  const img = element.querySelector("img");
  img.src = data.url;

  const h2 = element.querySelector("h2");
  h2.textContent = data.name;

  const p = element.querySelector("p");
  p.textContent = data.description;
}

const DB_SIZE = 1000;
const root = document.getElementById("app");
const DB = db(DB_SIZE, DB_SIZE, getItem);

const dataLoader = async (start, limit) => {
  const cursor = await DB.load(start, limit);
  return cursor.chunk;
};

const feed = new VirtualList(root, {
  templateFn,
  dataLoader,
  size: 10,
  updateTemplate
});
feed.render();
