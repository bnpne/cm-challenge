import "./styles/index.css";
import { format } from "date-fns";

class App {
  constructor() {
    // checker
    if (typeof window === "undefined") return;

    // Initialize variables
    this.sliderNav = null;
    this.sliderBar = null;
    this.sliderBounds = null;
    this.timeContainer = null;
    this.textContainer = null;
    this.data = null;
    this.buttons = [];
    this.activeButton = 0;

    this.init();
  }

  // Initialize the data and variables
  async init() {
    // Get slider nav and containers
    this.sliderNav = document.querySelector(".slider-nav-wrapper");
    this.sliderBar = document.querySelector(".slider-bar");
    this.textContainer = document.querySelector(".time-city-container");
    this.timeContainer = document.querySelector(".time");
    this.sliderBounds = this.sliderNav.getBoundingClientRect();
    this.initListeners();

    // Fetch data and set
    this.data = await this.fetchData();
    this.createDom();
  }

  // Data fetch
  async fetchData() {
    try {
      const res = await fetch("/lib/navigation.json");
      if (!res.ok) throw new Error("Cannot fetch JSON");
      return await res.json();
    } catch (error) {
      console.error(error);
      return null; // return null or handle as necessary
    }
  }

  // Create Dom
  createDom() {
    if (this.sliderNav && this.data?.cities) {
      this.data.cities.forEach((city, index) => {
        // Button Wrapper
        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("button-wrapper");

        // Button Element
        const buttonEl = document.createElement("button");
        buttonEl.classList.add("button");
        buttonEl.innerHTML = city.label;

        // Append
        buttonWrapper.appendChild(buttonEl);
        this.sliderNav.appendChild(buttonWrapper);

        // Create event listener
        buttonEl.addEventListener("click", () => this.click(index));

        // City and time elements
        const cityEl = document.createElement("p");
        cityEl.classList.add("time-city");
        cityEl.innerHTML = city.label;

        const timeEl = document.createElement("p");
        timeEl.classList.add("time-local");
        const time = this.getLocalTime(city.label);
        timeEl.innerHTML = format(new Date(time), "h:mm a");

        // Add elements to the container
        this.textContainer.appendChild(cityEl);
        this.timeContainer.appendChild(timeEl);

        // Create button object
        this.buttons[index] = {
          index,
          isActive: index === 0,
          wrapper: buttonWrapper,
          button: buttonEl,
          cityEl,
          label: city.label,
          section: city.section,
          bounds: null,
          time,
          timeEl,
        };
      });

      // After DOM is loaded set bar initial state
      this.updateSlider();
    }
  }

  getLocalTime(city) {
    const timeZoneMap = {
      "New York City": "America/New_York",
      Cupertino: "America/Los_Angeles",
      London: "Europe/London",
      Tokyo: "Asia/Tokyo",
      Sydney: "Australia/Sydney",
      Amsterdam: "Europe/Amsterdam",
      "Hong Kong": "Asia/Hong_Kong",
    };

    const timeZone = timeZoneMap[city];

    // Get the current time in the specified time zone
    const dateTime = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date());

    return dateTime;
  }

  updateSlider() {
    if (this.buttons.length === this.data.cities.length && this.sliderBar) {
      this.buttons.forEach((button) => {
        // Get bounds and time
        button.bounds = button.wrapper.getBoundingClientRect();
        button.time = this.getLocalTime(button.label);

        if (button.index === this.activeButton) {
          button.wrapper.classList.add("active");
          button.cityEl.classList.add("active");
          button.timeEl.classList.add("active");

          // Set sliderBar width and location
          this.sliderBar.style.width = `${button.bounds.width}px`;
          this.sliderBar.style.transform = `translate(${button.bounds.left}px, 0)`;
        } else {
          // Remove active classes
          button.wrapper.classList.remove("active");
          button.cityEl.classList.remove("active");
          button.timeEl.classList.remove("active");
        }
      });
    }
  }

  // Handle Click
  click(active) {
    this.activeButton = active;

    this.buttons.forEach((button, index) => {
      button.isActive = index === this.activeButton;
    });

    this.updateSlider();
  }

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Resize listener
  resize() {
    if (this.buttons.length === this.data.cities.length) {
      this.buttons.forEach((button) => {
        button.bounds = button.wrapper.getBoundingClientRect();
      });

      this.updateSlider();
    }
  }

  // Initialize Global Listeners
  initListeners() {
    window.addEventListener(
      "resize",
      this.debounce(this.resize.bind(this), 100)
    );
  }
}

new App();
