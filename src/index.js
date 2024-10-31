import "./styles/index.css";
import { format } from "date-fns";

class App {
  constructor() {
    // checker
    if (typeof window === undefined) return;

    // Initialize variables
    this.sliderNav;
    this.sliderBar;
    this.sliderBounds;
    this.timeContainer;
    this.textContainer;
    this.data;
    this.buttons = [];
    this.activeButton = 0;

    this.init();
  }

  // Initialize the data and variables
  async init() {
    // Get slider nav
    this.sliderNav = document.querySelector(".slider-nav-wrapper");
    this.sliderBar = document.querySelector(".slider-bar");
    this.textContainer = document.querySelector(".time-city-container");
    this.timeContainer = document.querySelector(".time");
    this.sliderBounds = this.sliderNav.getBoundingClientRect();
    this.initListeners();

    // Fetch data and set
    await this.fetchData().then((d) => {
      this.data = d;
      this.createDom();
    });
  }

  // Data fetch
  fetchData() {
    return fetch("/lib/navigation.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Cannot fetch JSON");
        }

        return res.json();
      })
      .catch((error) => {
        throw error;
      });
  }

  // Create Dom
  createDom() {
    if (this.sliderNav && this.data) {
      this.data?.cities?.forEach(async (city, index) => {
        // Button Wrapper
        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("button-wrapper");

        // Button Element
        const buttonEl = document.createElement("button");
        buttonEl.classList.add("button");

        // Add inner HMTL
        buttonEl.innerHTML = city?.label;

        // Append
        buttonWrapper.appendChild(buttonEl);
        this.sliderNav.appendChild(buttonWrapper);

        // Create event listener
        buttonEl.addEventListener("click", () => this.click(index));

        // City element
        const cityEl = document.createElement("p");
        cityEl.classList.add("time-city");
        cityEl.innerHTML = city?.label;

        // Get time
        const time = this.getLocalTime(city?.label);

        // City element
        const timeEl = document.createElement("p");
        const formatTime = format(new Date(time), "h:mm a");
        timeEl.classList.add("time-local");
        timeEl.innerHTML = formatTime;

        // Add city element
        this.textContainer.appendChild(cityEl);

        // Add time element
        this.timeContainer.appendChild(timeEl);

        // Create button object
        const buttonObj = {
          index: index,
          isActive: index === 0 ? true : false,
          wrapper: buttonWrapper,
          button: buttonEl,
          cityEl: cityEl,
          label: city?.label,
          section: city?.section,
          bounds: null,
          time: time,
          timeEl: timeEl,
        };

        this.buttons[index] = buttonObj;
      });

      // After dom is loaded set bar initial state
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
    if (this.buttons.length === this.data?.cities.length && this.sliderBar) {
      this.buttons.forEach((button) => {
        // Get bounds
        const bounds = button.wrapper.getBoundingClientRect();
        button.bounds = bounds;

        // Get time
        const time = this.getLocalTime(button.label);
        button.time = time;

        // If button is correct active index
        if (button.index === this.activeButton) {
          if (!button.wrapper.classList.contains("active")) {
            // Toggle active class
            button.wrapper.classList.toggle("active");
            button.cityEl.classList.toggle("active");
            button.timeEl.classList.toggle("active");
          }

          // set sliderBar width
          this.sliderBar.style.width = `${button.bounds?.width}px`;

          // set sliderBar location
          this.sliderBar.style.transform = `translate(${button.bounds.left}px, 0)`;
        } else {
          // Else, remove active classes
          button.wrapper.classList.remove("active");
          button.cityEl.classList.remove("active");
          button.timeEl.classList.remove("active");
        }
      });
    }
  }

  // Handle Click
  click(active) {
    // Set Active
    this.activeButton = active;

    this.buttons.forEach((button, index) => {
      if (index === this.activeButton) {
        button.isActive = true;
      } else {
        button.isActive = false;
      }
    });

    this.updateSlider();
  }

  // Resize listener
  resize() {
    if (this.buttons && this.buttons.length === this.data?.cities.length) {
      this.buttons.forEach((button) => {
        // Update button bounds
        const newBounds = button.wrapper?.getBoundingClientRect();
        button.bounds = newBounds;
      });

      this.updateSlider();
    }
  }

  // Initialize Global Listeners
  initListeners() {
    window.addEventListener("resize", this.resize.bind(this));
  }
}

new App();
