export default class VirtualList {
  constructor(root, { templateFn, dataLoader, size, updateTemplate }) {
    this.root = root;
    this.templateFn = templateFn;
    this.dataLoader = dataLoader;
    this.size = size;

    this.start = 0;
    this.end = size;

    this.elements = [];
    this.updateTemplate = updateTemplate;
    this.fetchSize = this.size / 2;

    /** to check if pagination started */
    this.isShifted = false;

    this.topSentinent = undefined;
    this.bottomSentinent = undefined;
  }

  async __topObserverCb(entries) {
    const [entry] = entries;
    if (entry.isIntersecting && this.isShifted) {
      console.log("top-observer");
      const dataArray = await this.dataLoader(this.start, this.fetchSize);
      if (this.start !== 0) {
        this.end -= this.fetchSize;
        this.start -= this.fetchSize;
      } else {
        this.isShifted = false;
      }

      let firstEl = this.elements[0];

      for (const index in dataArray) {
        const revIndex = dataArray.length - 1 - index;
        const item = dataArray[revIndex];
        const element = this.elements[this.fetchSize + +index];

        this.updateTemplate(element, item);
        const newY = +firstEl.dataset.translateY - element.scrollHeight;

        element.style.setProperty("transform", `translateY(${newY}px)`);
        element.dataset.translateY = newY;
        firstEl = element;
      }

      this.__updateSentinenets();
    }
  }

  async __bottomObserverCb(entries) {
    const [entry] = entries;
    if (entry.isIntersecting) {
      console.log("bottom observer");
      if (this.isShifted) {
        this.start += this.fetchSize;
        this.end += this.fetchSize;
      }

      const data = await this.dataLoader(this.end, this.fetchSize);

      let lastEl = this.elements[this.elements.length - 1];
      for (const index in data) {
        const item = data[index];

        const element = this.elements[index];
        this.updateTemplate(element, item);

        const yValue = +lastEl.dataset.translateY + lastEl.scrollHeight;
        element.style.setProperty("transform", `translateY(${yValue}px)`);
        element.dataset.translateY = yValue;

        lastEl = element;
      }
      this.__updateSentinenets();
      this.isShifted = true;
    }
  }

  __updateSentinenets() {
    this.elements.sort(
      (prev, next) => +prev.dataset.translateY - +next.dataset.translateY
    );

    const y = +this.elements[0].dataset.translateY;
    this.topSentinent.style.setProperty("transform", `translateY(${y}px)`);

    const bottomY = +this.elements[this.elements.length - 1].dataset.translateY;
    this.bottomSentinent.style.setProperty(
      "transform",
      `translateY(${bottomY}px)`
    );
  }

  async render() {
    const data = await this.dataLoader(this.start, this.start + this.size);

    const topObserver = new IntersectionObserver(
      this.__topObserverCb.bind(this)
    );
    const bottomObserver = new IntersectionObserver(
      this.__bottomObserverCb.bind(this)
    );

    this.topSentinent = document.createElement("div");
    this.topSentinent.classList.add("top", "sentinent");
    this.bottomSentinent = document.createElement("div");
    this.bottomSentinent.classList.add("bottom", "sentinent");

    topObserver.observe(this.topSentinent);
    bottomObserver.observe(this.bottomSentinent);

    const elements = data
      .map((item) => this.templateFn(item))
      .map((el) => {
        const container = document.createElement("div");
        container.classList.add("virtual-list-item");
        container.innerHTML = el;
        return container;
      });

    const listContainer = document.createElement("div");
    listContainer.append(...elements);
    this.root.append(listContainer);
    listContainer.classList.add("virtual-list");

    for (const index in elements) {
      const element = elements[index];
      if (element.previousSibling !== null) {
        // Getting the previous element if exists
        const sublingElement = element.previousElementSibling;
        // Getting the previous element height
        const siblingHeight = sublingElement.getBoundingClientRect().height;
        // Getting the previous element translateY
        const sublingTranslateY = +sublingElement.dataset.translateY || 0;
        // Calculating the position of current element
        const translateY = siblingHeight + sublingTranslateY;
        // Moving element
        element.style.transform = `translateY(${translateY}px)`;
        // Store the position in data attribute
        element.dataset.translateY = `${translateY}`;
      } else {
        element.style.setProperty("transform", "translateY(0px)");
      }
    }

    const lastElement = elements[elements.length - 1];

    this.bottomSentinent.style.setProperty(
      "transform",
      `translateY(${
        parseInt(lastElement.dataset.translateY) + lastElement.scrollHeight
      }px)`
    );
    listContainer.append(this.topSentinent, this.bottomSentinent);
    this.elements = elements;
  }
}
